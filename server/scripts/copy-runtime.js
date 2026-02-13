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

  // Copy Prisma schema and migrations
  const prismaSrc = path.join(process.cwd(), 'prisma');
  const prismaDst = path.join(process.cwd(), 'dist', 'prisma');

  // Node 16.7+ supports fs.cp with recursive: true
  try {
    if (fs.cp) {
        await fs.cp(prismaSrc, prismaDst, { recursive: true });
    } else {
        // Fallback for older Node versions if necessary (though likely not needed given the stack)
        // Simple recursive copy implementation if fs.cp is missing would be complex,
        // but assuming modern Node environment.
        console.warn('fs.cp not found, skipping prisma copy (update Node.js!)');
    }
    console.log(`Copied prisma directory to ${prismaDst}`);
  } catch (err) {
    console.error('Failed to copy prisma directory:', err);
    throw err;
  }
}

copyRuntime().catch((err) => {
  console.error('copy-runtime failed:', err);
  process.exit(1);
});
