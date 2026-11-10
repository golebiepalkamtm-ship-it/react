// Entry point for `npm run dev`.
//
// Marks the process as a local developer run before anything else loads, so
// index.ts / app.ts skip the side effects that belong only to the deployed
// server: `prisma migrate deploy` on start and the auction-closing cron.
// The deployed server starts from index.ts directly and is unaffected.
process.env.LOCAL_DEV = "true";

import("./index.js").catch((error) => {
  console.error("Failed to start the backend:", error);
  process.exit(1);
});

export {};
