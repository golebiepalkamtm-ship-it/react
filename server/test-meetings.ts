import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

// Load .env from the current directory
dotenv.config({ path: path.join(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function testMeetingCreation() {
  try {
    console.log("--- Testing Meeting Creation ---");
    console.log(
      "DATABASE_URL:",
      process.env.DATABASE_URL ? "Loaded" : "Missing",
    );

    // 1. Check if user exists (need an authorId)
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      console.log(
        "No users found in database. Cannot create meeting without author.",
      );
      return;
    }
    console.log(`Using user: ${firstUser.email} (${firstUser.id})`);

    // 2. Try to list meetings
    try {
      const meetings = await prisma.meeting.findMany({ take: 5 });
      console.log(`Existing meetings count: ${meetings.length}`);
    } catch (err: any) {
      console.error("❌ Failed to list meetings:", err.message);
      if (err.code === "P2021") {
        console.log('Table "meetings" does not exist.');
      }
      return;
    }

    // 3. Try to create a meeting
    console.log("Attempting to create a test meeting...");
    try {
      const testMeeting = await prisma.meeting.create({
        data: {
          name: "Test Meeting " + new Date().toISOString(),
          location: "Test Location",
          date: new Date(),
          description: "This is a test meeting",
          authorId: firstUser.id,
          images: [],
        },
      });
      console.log("✅ Meeting created successfully:", testMeeting.id);

      // Cleanup
      await prisma.meeting.delete({ where: { id: testMeeting.id } });
      console.log("🧹 Test meeting cleaned up");
    } catch (err: any) {
      console.error("❌ Failed to create meeting:", err.message);
      console.error("Error Code:", err.code);
      console.error("Meta:", err.meta);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testMeetingCreation();
