import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding test user and data...");

  const email = "test@example.com";
  const password = "password";
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Test User",
        password: hashedPassword,
      },
    });
    console.log("✅ Created test user");
  } else {
    // Update password if it's not hashed or just to be sure
    user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log("✅ Updated test user password");
  }

  // 2. Get some exercises
  const exercises = await prisma.exercise.findMany({
    take: 5,
  });

  if (exercises.length === 0) {
    console.error("❌ No exercises found! Run 'npm run seed' first.");
    process.exit(1);
  }

  // 3. Create a Routine
  const routine = await prisma.routine.create({
    data: {
      userId: user.id,
      name: "Push Day",
      notes: "Focus on chest and triceps",
    },
  });
  console.log("✅ Created routine");

  // 4. Create a WorkoutSession
  const session = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      routine_id: routine.id,
      name: "Morning Push Session",
      start_time: new Date(new Date().getTime() - 3600000), // 1 hour ago
      end_time: new Date(),
      duration_seconds: 3600,
    },
  });
  console.log("✅ Created workout session");

  // 5. Add WorkoutSets
  for (let i = 0; i < exercises.length; i++) {
    await prisma.workoutSet.create({
      data: {
        session_id: session.id,
        exercise_id: exercises[i].id,
        set_number: i + 1,
        weight: 50 + i * 5,
        reps: 10 + i,
      },
    });
  }
  console.log("✅ Added workout sets");

  // 6. Add BodyWeightLog
  await prisma.bodyWeightLog.create({
    data: {
      userId: user.id,
      weight: 80 + Math.random() * 5,
      date: new Date(new Date().getTime() - 86400000 * 2), // 2 days ago
    },
  });
  await prisma.bodyWeightLog.create({
    data: {
      userId: user.id,
      weight: 79 + Math.random() * 5,
      date: new Date(new Date().getTime() - 86400000), // 1 day ago
    },
  });
  console.log("✅ Added body weight logs");

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
