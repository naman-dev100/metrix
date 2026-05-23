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
      reps: number | null;
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

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    if (!exercises || exercises.length === 0) {
      return NextResponse.json({ error: "No exercises to save" }, { status: 400 });
    }

    for (const exercise of exercises) {
      if (!exercise.exerciseId || !exercise.exerciseName) {
        return NextResponse.json({ error: "Invalid exercise data" }, { status: 400 });
      }
      // Allow exercises with no sets — user can finish with empty exercises
    }

    const result = await transaction(async (client: any) => {
      // Get start time
      const sessionResult = await client.query(
        `SELECT start_time FROM "WorkoutSession" WHERE id = $1 AND "userId" = $2`,
        [sessionId, session.user.id]
      );
      if (!sessionResult.rows.length) {
        throw new Error("Workout session not found. It may have already been finished.");
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
        // Get historical sets for PR calculation
        const historicalResult = await client.query(
          `SELECT weight, reps FROM "WorkoutSet" ws
           JOIN "WorkoutSession" s ON s.id = ws.session_id
           WHERE ws.exercise_id = $1 AND s.start_time < $2 AND s."userId" = $3`,
          [exercise.exerciseId, startTime, session.user.id]
        );
        const historicalSets = historicalResult.rows;

        // Get sets from the last completed session containing this exercise for placeholder fallbacks
        const lastSessionResult = await client.query(
          `WITH last_session AS (
             SELECT ws.session_id
             FROM "WorkoutSet" ws
             JOIN "WorkoutSession" wss ON wss.id = ws.session_id
             WHERE wss."userId" = $1 AND ws.exercise_id = $2 AND wss.end_time IS NOT NULL AND wss.id != $3
             ORDER BY wss.end_time DESC
             LIMIT 1
           )
           SELECT 
             ws.set_number,
             ws.weight,
             ws.reps
           FROM "WorkoutSet" ws
           JOIN last_session ls ON ls.session_id = ws.session_id
           WHERE ws.exercise_id = $2
           ORDER BY ws.set_number ASC`,
          [session.user.id, exercise.exerciseId, sessionId]
        );
        const lastSessionSets = lastSessionResult.rows;

        for (const set of exercise.sets) {
          let finalWeight = set.weight;
          let finalReps = set.reps;

          // Apply fallbacks if user left input empty (so they get placeholder values)
          if (finalWeight === null || finalReps === null) {
            const matchingLastSet = lastSessionSets.find((h: any) => h.set_number === set.setNumber);
            if (matchingLastSet) {
              if (finalWeight === null) finalWeight = matchingLastSet.weight;
              if (finalReps === null) finalReps = matchingLastSet.reps;
            } else {
              // If there's no matching set number, fallback to first set of the last completed session
              if (lastSessionSets.length > 0) {
                if (finalWeight === null) finalWeight = lastSessionSets[0].weight;
                if (finalReps === null) finalReps = lastSessionSets[0].reps;
              } else {
                // If there's no history at all, fallback to standard defaults
                if (finalWeight === null) finalWeight = null;
                if (finalReps === null) finalReps = 10;
              }
            }
          }

          if (finalReps === null || finalReps === undefined) {
            finalReps = 10;
          }

          const isPR = calculatePR(finalWeight || 0, finalReps, historicalSets);

          await client.query(
            `INSERT INTO "WorkoutSet" (id, session_id, exercise_id, set_number, weight, reps, is_pr)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET weight = $5, reps = $6, is_pr = $7, set_number = $4`,
            [set.id, sessionId, exercise.exerciseId, set.setNumber, finalWeight, finalReps, isPR]
          );

          if (isPR && !prExercises.find((p) => p.name === exercise.exerciseName)) {
            prExercises.push({
              name: exercise.exerciseName,
              weight: finalWeight || 0,
              reps: finalReps,
            });
          }
        }
      }

      return { success: true, duration: durationSeconds, prExercises };
    });


    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error finishing workout:", error);
    
    const pgCode = error?.code;
    let errorMessage = "Failed to finish workout";
    
    if (pgCode === "23503") {
      errorMessage = error?.detail || "Exercise not found. Start a new workout to add exercises again.";
    } else if (pgCode === "23505") {
      errorMessage = "Duplicate set detected. Your workout was saved.";
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
