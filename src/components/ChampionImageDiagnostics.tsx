import { useState, useEffect } from "react";

interface ManifestItem {
  id: number;
  image: string;
}

interface Manifest {
  champions: ManifestItem[];
}

interface DiagnosticResult {
  id: number;
  imageUrl: string;
  status: "SUCCESS" | "FAIL";
  statusCode?: number;
}

export const ChampionImageDiagnostics = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to sanitize URLs for href attributes
  const getSafeImageUrl = (url: string) => {
    try {
      const lowerUrl = url.toLowerCase().trim();
      if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:') || lowerUrl.startsWith('vbscript:')) {
        return '#';
      }
      
      if (url.startsWith('/')) {
        return url;
      }

      const parsed = new URL(url, window.location.origin);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.href;
      }
      return '#';
    } catch {
      return '#';
    }
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        const manifestRes = await fetch("/champions/manifest.json");
        if (!manifestRes.ok) {
          throw new Error("Failed to fetch manifest.json");
        }
        const manifest: Manifest = await manifestRes.json();

        const promises = manifest.champions.map(
          async (item): Promise<DiagnosticResult> => {
            const imageUrl = `/champions/${item.id}/gallery/${encodeURIComponent(item.image)}`;
            try {
              // We use a HEAD request because we only need to check for existence, not download the whole image.
              const res = await fetch(imageUrl, { method: "HEAD" });
              return {
                id: item.id,
                imageUrl,
                status: res.ok ? ("SUCCESS" as const) : ("FAIL" as const),
                statusCode: res.status,
              };
            } catch (error) {
              return {
                id: item.id,
                imageUrl,
                status: "FAIL" as const,
              };
            }
          },
        );

        const diagnosticResults = await Promise.all(promises);
        setResults(diagnosticResults);
      } catch (error) {
        console.error("Diagnostic error:", error);
      } finally {
        setLoading(false);
      }
    };

    runDiagnostics();
  }, []);

  if (loading) {
    return <div className="diagnostics-loading">Running diagnostics...</div>;
  }

  return (
    <div className="diagnostics-overlay">
      <h2>Champion Image Diagnostics</h2>
      <p>
        This script checks if the champion images are accessible from the
        browser.
      </p>
      <ul>
        {results.map((result) => (
          <li
            key={result.id}
            className={`diagnostics-item ${result.status === "SUCCESS" ? "success" : "fail"}`}
          >
            <strong>{result.status}</strong> - (HTTP {result.statusCode}) -{" "}
            {/* file deepcode ignore XSS: Internal UI component with safe react state */}
            <a
              href={getSafeImageUrl(result.imageUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="diagnostics-link"
            >
              {result.imageUrl}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
