import "./env.js";
import { prisma } from "./lib/db.js";

async function checkTriggers() {
  console.log("🔍 Checking for Supabase User Sync Triggers...\n");
  try {
    const triggers = await prisma.$queryRaw`
      SELECT trigger_name, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE trigger_name LIKE '%sync%' OR trigger_name LIKE '%user%'
    `;
    console.log("Triggers found:", triggers);

    const functions = await prisma.$queryRaw`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name LIKE '%sync%' OR routine_name LIKE '%user%'
    `;
    console.log("Functions found:", functions);
  } catch (error) {
    console.error("Failed to check triggers:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTriggers();
