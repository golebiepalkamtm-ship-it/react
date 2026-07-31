import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { searchSaosJudgments, getSaosJudgmentDetails, listSaosCourts } from "../services/saosClient.js";

export function registerSaosTools(server: McpServer): void {
  // Tool 1: General Judgment Search
  server.registerTool(
    "saos_search_judgments",
    {
      title: "Szukaj Orzeczeń w SAOS",
      description: `Wyszukuje orzeczenia polskich sądów w bazie SAOS (System Analizy Orzeczeń Sądowych).
Umożliwia filtrowanie po treści, sygnaturze akt, nazwisku sędziego, rodzaju sądu (np. COMMON, SUPREME), zakresie dat orzeczenia oraz po powołanych przepisach prawnych.`,
      inputSchema: z.object({
        query: z.string().optional().describe("Zapytanie słowne lub fraza do przeszukania w treści/tezach orzeczeń"),
        case_number: z.string().optional().describe("Sygnatura akt (np. 'I ACa 1010/09' lub 'II CSK 123/15')"),
        judge_name: z.string().optional().describe("Imię i/lub nazwisko sędziego (np. 'Andrzej Struzik')"),
        law_clause: z.string().optional().describe("Powołana podstawa prawna lub przepis (np. 'art. 415 kc')"),
        court_type: z.enum(["COMMON", "SUPREME", "CONSTITUTIONAL_TRIBUNAL", "NATIONAL_APPEAL_CHAMBER", "ADMINISTRATIVE"])
          .optional()
          .describe("Typ sądu: COMMON (Sądy powszechne), SUPREME (Sąd Najwyższy), CONSTITUTIONAL_TRIBUNAL (Trybunał Konstytucyjny), NATIONAL_APPEAL_CHAMBER (KIO), ADMINISTRATIVE (Sądy administracyjne)"),
        date_from: z.string().optional().describe("Początek zakresu dat orzeczeń w formacie YYYY-MM-DD"),
        date_to: z.string().optional().describe("Koniec zakresu dat orzeczeń w formacie YYYY-MM-DD"),
        page_size: z.number().int().min(1).max(50).default(10).describe("Liczba orzeczeń do pobrania na stronę (domyślnie 10)"),
        page_number: z.number().int().min(0).default(0).describe("Numer strony (od 0)")
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const result = await searchSaosJudgments({
          all: params.query,
          caseNumber: params.case_number,
          judgeName: params.judge_name,
          lawClause: params.law_clause,
          courtType: params.court_type,
          judgmentDateFrom: params.date_from,
          judgmentDateTo: params.date_to,
          pageSize: params.page_size,
          pageNumber: params.page_number
        });

        const items = result.items || [];
        const total = result.info?.totalResults || 0;

        if (items.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "Nie znaleziono orzeczeń spełniających podane kryteria."
              }
            ],
            structuredContent: { total: 0, items: [] }
          };
        }

        const formattedMarkdown = [
          `# Wyniki wyszukiwania SAOS (Znaleziono ogółem: ${total})`,
          `Strona ${params.page_number + 1} (Wyświetlono ${items.length} orzeczeń):`,
          ""
        ];

        for (const item of items) {
          const caseNo = item.courtCases?.map(c => c.caseNumber).join(", ") || "Brak sygnatury";
          const courtName = item.division?.court?.name || item.courtType;
          const divisionName = item.division?.name ? ` - ${item.division.name}` : "";
          const date = item.judgmentDate || "Brak daty";
          const judgesStr = item.judges?.map(j => j.name).join(", ") || "Brak danych";
          const keywordsStr = item.keywords?.length ? `Keywords: ${item.keywords.join(", ")}` : "";

          // Clean up HTML tags from snippet if present
          const snippet = (item.textContent || "")
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 300);

          formattedMarkdown.push(`## Orzeczenie ID: ${item.id} | Sygn. ${caseNo}`);
          formattedMarkdown.push(`- **Sąd**: ${courtName}${divisionName}`);
          formattedMarkdown.push(`- **Data orzeczenia**: ${date}`);
          formattedMarkdown.push(`- **Skład sędziowski**: ${judgesStr}`);
          if (keywordsStr) formattedMarkdown.push(`- **Słowa kluczowe**: ${keywordsStr}`);
          if (snippet) formattedMarkdown.push(`- **Fragment**: ${snippet}...`);
          formattedMarkdown.push("");
        }

        return {
          content: [
            {
              type: "text",
              text: formattedMarkdown.join("\n")
            }
          ],
          structuredContent: {
            total,
            pageNumber: params.page_number,
            pageSize: params.page_size,
            items: items.map(i => ({
              id: i.id,
              courtCases: i.courtCases,
              courtType: i.courtType,
              judgmentDate: i.judgmentDate,
              judges: i.judges,
              division: i.division
            }))
          }
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Błąd podczas odpytywania SAOS API: ${error.message || String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool 2: Get Detailed Judgment by ID
  server.registerTool(
    "saos_get_judgment_details",
    {
      title: "Pobierz Pełne Orzeczenie SAOS po ID",
      description: "Pobiera szczegółowe dane konkretnego orzeczenia z systemu SAOS na podstawie jego numeru ID (w tym uzasadnienie, tezę, skład sędziowski, podstawę prawną).",
      inputSchema: z.object({
        id: z.number().int().positive().describe("Identyfikator ID orzeczenia w bazie SAOS (np. 1)")
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ id }) => {
      try {
        const details = await getSaosJudgmentDetails(id);
        const data = details.data;

        if (!data) {
          return {
            content: [{ type: "text", text: `Nie odnaleziono orzeczenia o ID ${id}.` }]
          };
        }

        const caseNo = data.courtCases?.map(c => c.caseNumber).join(", ") || "Brak sygnatury";
        const courtName = data.division?.court?.name || data.courtType;
        const divisionName = data.division?.name ? ` - ${data.division.name}` : "";
        const judges = data.judges?.map(j => `${j.name}${j.specialRoles?.length ? ` (${j.specialRoles.join(", ")})` : ""}`).join("\n  - ") || "Brak danych";

        const textClean = (data.textContent || "")
          .replace(/<p>/gi, "\n")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]*>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/\n\s*\n/g, "\n\n")
          .trim();

        // Truncate text content if extremely long
        const truncatedText = textClean.length > 15000 
          ? textClean.slice(0, 15000) + "\n\n[... Treść skrócona ze względu na limit ...] " 
          : textClean;

        const formattedMarkdown = [
          `# Szczegóły Orzeczenia ID: ${data.id}`,
          `**Sygnatura akt**: ${caseNo}`,
          `**Sąd**: ${courtName}${divisionName}`,
          `**Data**: ${data.judgmentDate || "Brak daty"}`,
          `**Typ orzeczenia**: ${data.judgmentType || "Nieokreślony"}`,
          "",
          "### Skład sędziowski:",
          `  - ${judges}`,
          ""
        ];

        if (data.summary) {
          formattedMarkdown.push("### Teza / Streszczenie:", data.summary, "");
        }

        if (data.legalBases?.length) {
          formattedMarkdown.push("### Podstawa prawna:", data.legalBases.map(l => `- ${l}`).join("\n"), "");
        }

        if (data.referencedRegulations?.length) {
          formattedMarkdown.push(
            "### Powołane przepisy:",
            data.referencedRegulations.map(r => `- ${r.rawTitle || r.text || "Przepis"}`).join("\n"),
            ""
          );
        }

        formattedMarkdown.push("### Treść orzeczenia / Uzasadnienie:", "", truncatedText);

        return {
          content: [
            {
              type: "text",
              text: formattedMarkdown.join("\n")
            }
          ],
          structuredContent: {
            id: data.id,
            courtCases: data.courtCases,
            judgmentDate: data.judgmentDate,
            courtType: data.courtType,
            judges: data.judges,
            summary: data.summary,
            legalBases: data.legalBases
          }
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Błąd podczas pobierania orzeczenia ID ${id}: ${error.message || String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool 3: Search by Law Clause
  server.registerTool(
    "saos_search_by_article",
    {
      title: "Szukaj Orzeczeń wg Artykułu / Przepisu",
      description: "Szybkie wyszukiwanie orzeczeń sądowych w SAOS powołujących się na konkretny artykuł lub przepis prawny (np. 'art. 415 kc', 'art. 148 kk', 'art. 5 kks').",
      inputSchema: z.object({
        law_clause: z.string().min(2).describe("Przepis prawny (np. 'art. 415 kc', 'art. 148 kk')"),
        limit: z.number().int().min(1).max(30).default(10).describe("Liczba wyników (domyślnie 10)")
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ law_clause, limit }) => {
      try {
        const result = await searchSaosJudgments({
          lawClause: law_clause,
          pageSize: limit,
          pageNumber: 0
        });

        const items = result.items || [];
        const total = result.info?.totalResults || 0;

        if (items.length === 0) {
          return {
            content: [{ type: "text", text: `Nie znaleziono orzeczeń powołujących się na przepis: '${law_clause}'.` }]
          };
        }

        const lines = [
          `# Orzeczenia powołujące przepis: '${law_clause}' (Łącznie: ${total})`,
          ""
        ];

        for (const item of items) {
          const caseNo = item.courtCases?.map(c => c.caseNumber).join(", ") || "Brak sygnatury";
          const court = item.division?.court?.name || item.courtType;
          lines.push(`- **[ID ${item.id}]** Sygn. **${caseNo}** (${court}, ${item.judgmentDate || "brak daty"})`);
        }

        return {
          content: [{ type: "text", text: lines.join("\n") }],
          structuredContent: { law_clause, total, items }
        };
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Błąd wyszukiwania: ${error.message || String(error)}` }]
        };
      }
    }
  );

  // Tool 4: List Courts
  server.registerTool(
    "saos_list_courts",
    {
      title: "Wykaz Sądów Powszechnych SAOS",
      description: "Pobiera wykaz sądów powszechnych dostępnych w bazie SAOS.",
      inputSchema: z.object({}).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async () => {
      try {
        const courts = await listSaosCourts();
        const courtList = Array.isArray(courts) ? courts : (courts?.items || []);

        const formatted = courtList.slice(0, 50).map((c: any) => `- **[ID ${c.id}]** ${c.name || c.code}`).join("\n");

        return {
          content: [
            {
              type: "text",
              text: `# Wykaz sądów w bazie SAOS (Pokazano ${Math.min(courtList.length, 50)} z ${courtList.length}):\n\n${formatted}`
            }
          ],
          structuredContent: { count: courtList.length, courts: courtList.slice(0, 50) }
        };
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Błąd pobierania sądów: ${error.message || String(error)}` }]
        };
      }
    }
  );
}
