import "./env.js";
import { prisma } from "./lib/db.js";

async function check() {
  const tables = ["meetings", "audit_logs", "users"];
  for (const t of tables) {
    const cols = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${t} AND table_schema = 'public'
    `;
    console.log(
      `Column names for public.${t}:`,
      cols.map((c) => c.column_name),
    );
  }
}
check();
