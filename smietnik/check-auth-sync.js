import "./env.js";
import { prisma } from "./lib/db.js";

async function checkAuthTriggers() {
  console.log("🔍 Checking for Triggers in AUTH schema...\n");
  try {
    const triggers = await prisma.$queryRaw`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth'
    `;
    console.log("Triggers found in auth schema:", triggers);
  } catch (error) {
    console.error(
      "Failed to check auth triggers (maybe no permission):",
      error,
    );
  } finally {
    await prisma.$disconnect();
  }
}

checkAuthTriggers();
