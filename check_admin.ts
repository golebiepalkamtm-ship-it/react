import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkUser() {
  const users = await prisma.user.findMany({
    where: {
      OR: [{ email: "superadmin@palkamtm.pl" }, { role: "ADMIN" }],
    },
  });
  console.log("Admin Users:", JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

checkUser();
