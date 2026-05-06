import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "test@example.com";
  const password = "password";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Attempting to create/update user ${email} with password ${password}...`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name: "Test User",
    },
    create: {
      email,
      name: "Test User",
      password: hashedPassword,
    },
  });

  console.log("✅ User synced successfully:", user.email);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
