#!/usr/bin/env node
// Create a defensive entrypoint at dist/index.js that probes several possible server entry files
import fs from 'fs';
import path from 'path';

const d = path.join(process.cwd(), 'dist');
if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

// Candidate entry paths (relative to dist/)
const candidates = [
  './index.js',
  './index.cjs',
  './index.mjs'
];

// Generate an ES modules bootstrap that checks which file exists and then loads it
// Write to a distinct filename (bootstrap.js) so we don't risk importing the
// bootstrap itself when a top-level index.js exists.
const content = `import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const base = __dirname;
  const candidates = ${JSON.stringify(candidates)};

  for (const rel of candidates) {
    const fullPath = path.join(base, rel);
    try {
      if (fs.existsSync(fullPath)) {
        console.log('Found server entry:', rel);
        if (rel.endsWith('.cjs')) {
          const { createRequire } = await import('module');
          const require = createRequire(import.meta.url);
          require(fullPath);
        } else {
          await import(pathToFileURL(fullPath).href);
        }
        return;
      }
    } catch (err) {
      console.error('CRITICAL: Error loading server entry:', rel);
      console.error(err);
      process.exit(1); // Exit immediately on load errors to prevent confusing "not found" messages
    }
  }

  console.error('Failed to find any server entrypoint. Looked at:', candidates.join(', '));
  process.exit(1);
})();\n`;

fs.writeFileSync(path.join(d, 'bootstrap.js'), content);
console.log('Created defensive dist/bootstrap.js (probes:', candidates.join(', '), ')');

// Ensure that JS-only assets (e.g., server/lib/logger.js) are copied to dist
const srcLib = path.join(process.cwd(), 'lib');
const destLib = path.join(d, 'lib');
if (fs.existsSync(srcLib)) {
  if (!fs.existsSync(destLib)) fs.mkdirSync(destLib, { recursive: true });
  const files = fs.readdirSync(srcLib).filter(f => f.endsWith('.js'));
  for (const f of files) {
    fs.copyFileSync(path.join(srcLib, f), path.join(destLib, f));
    console.log('Copied', f, 'to dist/lib');
  }
}
