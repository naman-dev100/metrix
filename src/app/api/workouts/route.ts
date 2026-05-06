import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await query(`
      SELECT
        ws.id,
        ws.name,
        ws.start_time,
        ws.end_time,
        ws.duration_seconds,
        r.name as routine_name,
        ws.routine_id,
        (
          SELECT json_agg(
            json_build_object(
              'exerciseName', e.name,
              'weight', ws_sets.weight,
              'reps', ws_sets.reps,
              'set_number', ws_sets.set_number,
              'is_pr', ws_sets.is_pr
            )
            ORDER BY ws_sets.set_number ASC
          )
          FROM "WorkoutSet" ws_sets
          JOIN "Exercise" e ON e.id = ws_sets.exercise_id
          WHERE ws_sets.session_id = ws.id
        ) as exercises,
        (
          SELECT count(*)
          FROM "WorkoutSet" ws_sets
          WHERE ws_sets.session_id = ws.id AND ws_sets.is_pr = true
        ) as pr_count,
        (
          SELECT count(*)
          FROM "WorkoutSet" ws_sets
          WHERE ws_sets.session_id = ws.id
        ) as total_sets,
        (
          SELECT COALESCE(SUM(ws_sets.weight * ws_sets.reps), 0)
          FROM "WorkoutSet" ws_sets
          WHERE ws_sets.session_id = ws.id
        ) as total_volume
      FROM "WorkoutSession" ws
      LEFT JOIN "Routine" r ON r.id = ws.routine_id
      WHERE ws.end_time IS NOT NULL
      AND ws."userId" = $1
      ORDER BY ws.start_time DESC
      LIMIT 50
    `, [session.user.id]);

    // The json_agg might return null if no sets exist
    const formattedResults = results.map((w: any) => ({
      id: w.id,
      name: w.name || w.routine_name || "Quick Workout",
      start_time: w.start_time,
      end_time: w.end_time,
      duration_seconds: w.duration_seconds,
      total_sets: parseInt(w.total_sets || "0"),
      total_volume: parseFloat(w.total_volume || "0"),
      pr_count: parseInt(w.pr_count || "0"),
      exercises: w.exercises || [],
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Error in GET /api/workouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
      { status: 500 }
    );
  }
}
