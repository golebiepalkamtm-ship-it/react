import "./env.js";
import { prisma } from "./lib/db.js";

async function testMeeting() {
  const authorId = "0d35b85c-a83c-41e9-9d18-559c4e42d2dd";
  console.log(`Testing meeting creation for author: ${authorId}`);

  try {
    const meeting = await prisma.meeting.create({
      data: {
        name: "Test Meeting from Script",
        location: "Lubań",
        date: new Date(),
        description: "Testing if DB write works",
        images: [],
        authorId: authorId,
      },
    });
    console.log("✅ Meeting created:", meeting.id);

    // Cleanup
    await prisma.meeting.delete({ where: { id: meeting.id } });
    console.log("✅ Meeting deleted (cleanup)");
  } catch (error) {
    console.error("❌ FAILED to create/delete meeting:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testMeeting();
