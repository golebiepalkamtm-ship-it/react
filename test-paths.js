
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePathCandidates(candidates) {
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return { path: p, exists: true };
    } catch {
      // ignore
    }
  }
  return { path: candidates[0], exists: false };
}

function resolveRepoPublicDir() {
  const cwd = process.cwd();
  return resolvePathCandidates([
    path.resolve(cwd, 'public'),
    path.resolve(cwd, '..', 'public'),
    path.resolve(__dirname, '..', '..', 'public'),
  ]);
}

function resolveServerDataDir() {
  const cwd = process.cwd();
  return resolvePathCandidates([
    path.resolve(cwd, 'data'),
    path.resolve(cwd, 'server', 'data'),
    path.resolve(__dirname, '..', 'data'),
  ]);
}

console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Public Dir:', resolveRepoPublicDir());
console.log('Data Dir:', resolveServerDataDir());

const publicDir = resolveRepoPublicDir().path;
const manifestPath = path.join(publicDir, 'champions', 'manifest.json');
console.log('Manifest Path:', manifestPath, 'Exists:', fs.existsSync(manifestPath));

const dataDir = resolveServerDataDir().path;
const meetingsPath = path.join(dataDir, 'meetings.json');
console.log('Meetings Path:', meetingsPath, 'Exists:', fs.existsSync(meetingsPath));
