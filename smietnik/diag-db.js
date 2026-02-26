import "./env.js";
import { prisma } from "./lib/db.js";

async function logUser() {
  const user = await prisma.user.findFirst();
  if (user) {
    console.log(`User ID: ${user.id}`);
    console.log(`User Email: ${user.email}`);
    console.log(`User Role: ${user.role}`);
  } else {
    console.log("No user found");
  }
}
logUser();
