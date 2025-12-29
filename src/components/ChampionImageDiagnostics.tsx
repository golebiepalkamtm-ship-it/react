import { useState, useEffect } from 'react';

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
  status: 'SUCCESS' | 'FAIL';
  statusCode?: number;
}

export const ChampionImageDiagnostics = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        const manifestRes = await fetch('/champions/manifest.json');
        if (!manifestRes.ok) {
          throw new Error('Failed to fetch manifest.json');
        }
        const manifest: Manifest = await manifestRes.json();

        const promises = manifest.champions.map(async (item) => {
          const imageUrl = `/champions/${item.id}/gallery/${encodeURIComponent(item.image)}`;
          try {
            // We use a HEAD request because we only need to check for existence, not download the whole image.
            const res = await fetch(imageUrl, { method: 'HEAD' });
            return {
              id: item.id,
              imageUrl,
              status: res.ok ? 'SUCCESS' : 'FAIL',
              statusCode: res.status,
            };
          } catch (error) {
            return {
              id: item.id,
              imageUrl,
              status: 'FAIL',
            };
          }
        });

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
    return <div style={{ position: 'fixed', top: '10px', left: '10px', background: 'black', color: 'white', padding: '10px', zIndex: 9999 }}>Running diagnostics...</div>;
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', color: 'white', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
      <h2>Champion Image Diagnostics</h2>
      <p>This script checks if the champion images are accessible from the browser.</p>
      <ul>
        {results.map(result => (
          <li key={result.id} style={{ color: result.status === 'SUCCESS' ? '#7CFC00' : '#FF474C', fontFamily: 'monospace', fontSize: '14px' }}>
            <strong>{result.status}</strong> - (HTTP {result.statusCode}) - <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" style={{color: 'white'}}>{result.imageUrl}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};
