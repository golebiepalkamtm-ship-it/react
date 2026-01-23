import { promises as fs } from 'fs';
import path from 'path';

async function copyRuntime() {
  const srcDir = path.join(process.cwd(), 'lib');
  const dstDir = path.join(process.cwd(), 'dist', 'lib');

  await fs.mkdir(dstDir, { recursive: true });

  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  const tasks = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map(async (entry) => {
      const src = path.join(srcDir, entry.name);
      const dst = path.join(dstDir, entry.name);
      await fs.copyFile(src, dst);
    });

  await Promise.all(tasks);
  console.log(`Copied runtime JS files to ${dstDir}`);
}

copyRuntime().catch((err) => {
  console.error('copy-runtime failed:', err);
  process.exit(1);
});
