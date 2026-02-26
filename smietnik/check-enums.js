import "./env.js";
import { prisma } from "./lib/db.js";

async function checkEnums() {
  const enums = await prisma.$queryRaw`
    SELECT t.typname as enum_name, string_agg(e.enumlabel, ', ') as values
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    WHERE t.typname IN ('UserRole', 'Sex', 'AuctionStatus', 'AuctionCategory')
    GROUP BY t.typname
  `;
  console.log(enums);
}
checkEnums();
