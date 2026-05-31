import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "password";
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Delete test@example.com user if it exists
  console.log("Removing test@example.com user...");
  const deleteResult = await prisma.user.deleteMany({
    where: { email: "test@example.com" }
  });
  console.log(`✅ Removed ${deleteResult.count} user(s) matching test@example.com`);

  // 2. Sync/upsert dev@testing.com user
  const email = "dev@testing.com";
  console.log(`Syncing user ${email} with password "${password}"...`);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name: "Developer",
    },
    create: {
      email,
      name: "Developer",
      password: hashedPassword,
    },
  });
  console.log("✅ Synced:", user.email);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
