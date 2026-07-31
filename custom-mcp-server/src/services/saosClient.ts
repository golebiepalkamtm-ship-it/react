import { CHARACTER_LIMIT } from "../constants.js";
import { logError } from "../utils/logger.js";

const SAOS_BASE_URL = "https://www.saos.org.pl/api";

export interface SaosSearchOptions {
  all?: string;                   // Pełnotekstowe zapytanie
  caseNumber?: string;            // Sygnatura akt
  judgeName?: string;             // Nazwisko sędziego
  courtType?: "COMMON" | "SUPREME" | "CONSTITUTIONAL_TRIBUNAL" | "NATIONAL_APPEAL_CHAMBER" | "ADMINISTRATIVE";
  ccCourtType?: "APPEAL" | "REGIONAL" | "DISTRICT";
  ccCourtId?: number;
  judgmentDateFrom?: string;      // YYYY-MM-DD
  judgmentDateTo?: string;        // YYYY-MM-DD
  lawClause?: string;             // Powołana podstawa prawna / przepis
  pageSize?: number;              // 10 - 100
  pageNumber?: number;            // Strona (od 0)
  sortingField?: string;
  sortingDirection?: "ASC" | "DESC";
}

export interface SaosJudgmentItem {
  id: number;
  href: string;
  courtType: string;
  courtCases: Array<{ caseNumber: string }>;
  judgmentType?: string;
  judgmentDate?: string;
  judges?: Array<{ name: string; specialRoles?: string[] }>;
  textContent?: string;
  keywords?: string[];
  division?: {
    name: string;
    court?: {
      name: string;
    };
  };
}

export interface SaosSearchResponse {
  items: SaosJudgmentItem[];
  info: {
    totalResults: number;
  };
  queryTemplate?: any;
}

export interface SaosJudgmentDetailsResponse {
  data: {
    id: number;
    courtType: string;
    judgmentType?: string;
    judgmentDate?: string;
    courtCases?: Array<{ caseNumber: string }>;
    judges?: Array<{ name: string; function?: string; specialRoles?: string[] }>;
    courtReporters?: string[];
    decision?: string;
    summary?: string;
    textContent?: string;
    keywords?: string[];
    referencedRegulations?: Array<{
      rawTitle?: string;
      journalTitle?: string;
      journalNo?: number;
      journalYear?: number;
      journalEntry?: number;
      text?: string;
    }>;
    legalBases?: string[];
    division?: {
      name: string;
      court?: {
        name: string;
      };
    };
  };
}

export async function searchSaosJudgments(options: SaosSearchOptions): Promise<SaosSearchResponse> {
  try {
    const url = new URL(`${SAOS_BASE_URL}/search/judgments`);

    if (options.all) url.searchParams.set("all", options.all);
    if (options.caseNumber) url.searchParams.set("caseNumber", options.caseNumber);
    if (options.judgeName) url.searchParams.set("judgeName", options.judgeName);
    if (options.courtType) url.searchParams.set("courtType", options.courtType);
    if (options.ccCourtType) url.searchParams.set("ccCourtType", options.ccCourtType);
    if (options.ccCourtId) url.searchParams.set("ccCourtId", String(options.ccCourtId));
    if (options.judgmentDateFrom) url.searchParams.set("judgmentDateFrom", options.judgmentDateFrom);
    if (options.judgmentDateTo) url.searchParams.set("judgmentDateTo", options.judgmentDateTo);
    if (options.lawClause) url.searchParams.set("legalBase", options.lawClause);

    url.searchParams.set("pageSize", String(options.pageSize ?? 10));
    url.searchParams.set("pageNumber", String(options.pageNumber ?? 0));
    if (options.sortingField) url.searchParams.set("sortingField", options.sortingField);
    if (options.sortingDirection) url.searchParams.set("sortingDirection", options.sortingDirection);

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`SAOS API HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as SaosSearchResponse;
    return data;
  } catch (error) {
    logError("Error in searchSaosJudgments:", error);
    throw error;
  }
}

export async function getSaosJudgmentDetails(id: number): Promise<SaosJudgmentDetailsResponse> {
  try {
    const response = await fetch(`${SAOS_BASE_URL}/judgments/${id}`, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`SAOS API HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as SaosJudgmentDetailsResponse;
    return data;
  } catch (error) {
    logError(`Error in getSaosJudgmentDetails for ID ${id}:`, error);
    throw error;
  }
}

export async function listSaosCourts(): Promise<any> {
  try {
    const response = await fetch(`${SAOS_BASE_URL}/dump/courts`, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`SAOS API HTTP Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logError("Error in listSaosCourts:", error);
    throw error;
  }
}
