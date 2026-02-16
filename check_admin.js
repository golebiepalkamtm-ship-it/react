import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [{ role: "ADMIN" }, { email: "superadmin@palkamtm.pl" }],
      },
    });
    console.log("--- ADMIN USERS ---");
    console.log(JSON.stringify(users, null, 2));
    console.log("-------------------");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
