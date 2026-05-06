import { query, transaction } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface FinishPayload {
  sessionId: string;
  routineId: string | null;
  name: string | null;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: {
      id: string;
      setNumber: number;
      weight: number | null;
      reps: number;
      isPR?: boolean;
    }[];
  }[];
}

function calculatePR(
  currentWeight: number,
  currentReps: number,
  historicalSets: { weight: number | null; reps: number }[]
): boolean {
  let maxWeight = 0;
  let maxRepsForMaxWeight = 0;

  for (const set of historicalSets) {
    if (set.weight === null) continue;
    if (set.weight > maxWeight) {
      maxWeight = set.weight;
      maxRepsForMaxWeight = set.reps;
    } else if (set.weight === maxWeight && set.weight > 0) {
      if (set.reps > maxRepsForMaxWeight) {
        maxRepsForMaxWeight = set.reps;
      }
    }
  }

  if (currentWeight > maxWeight) return true;
  if (currentWeight === maxWeight && currentWeight > 0 && currentReps > maxRepsForMaxWeight) return true;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: FinishPayload = await request.json();
    const { sessionId, routineId, name, exercises } = body;

    const result = await transaction(async (client: any) => {
      // Get start time
      const sessionResult = await client.query(
        `SELECT start_time FROM "WorkoutSession" WHERE id = $1 AND "userId" = $2`,
        [sessionId, session.user.id]
      );
      if (!sessionResult.rows.length) {
        throw new Error("Session not found");
      }
      const startTime = sessionResult.rows[0].start_time;
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Update session
      await client.query(
        `UPDATE "WorkoutSession" SET end_time = $1, duration_seconds = $2 WHERE id = $3 AND "userId" = $4`,
        [endTime, durationSeconds, sessionId, session.user.id]
      );

      if (name) {
        await client.query(`UPDATE "WorkoutSession" SET name = $1 WHERE id = $2 AND "userId" = $3`, [name, sessionId, session.user.id]);
      }

      // Calculate PRs and save sets
      const prExercises: { name: string; weight: number; reps: number }[] = [];

      for (const exercise of exercises) {
        // Get historical sets
        const historicalResult = await client.query(
          `SELECT weight, reps FROM "WorkoutSet" ws
           JOIN "WorkoutSession" s ON s.id = ws.session_id
           WHERE ws.exercise_id = $1 AND s.start_time < $2 AND s."userId" = $3`,
          [exercise.exerciseId, startTime, session.user.id]
        );
        const historicalSets = historicalResult.rows;

        for (const set of exercise.sets) {
          const isPR = calculatePR(set.weight || 0, set.reps, historicalSets);

          await client.query(
            `INSERT INTO "WorkoutSet" (id, session_id, exercise_id, set_number, weight, reps, is_pr)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET weight = $5, reps = $6, is_pr = $7, set_number = $4`,
            [set.id, sessionId, exercise.exerciseId, set.setNumber, set.weight, set.reps, isPR]
          );

          if (isPR && !prExercises.find((p) => p.name === exercise.exerciseName)) {
            prExercises.push({
              name: exercise.exerciseName,
              weight: set.weight || 0,
              reps: set.reps,
            });
          }
        }
      }

      return { success: true, duration: durationSeconds, prExercises };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error finishing workout:", error);
    return NextResponse.json(
      { error: error.message || "Failed to finish workout" },
      { status: 500 }
    );
  }
}
