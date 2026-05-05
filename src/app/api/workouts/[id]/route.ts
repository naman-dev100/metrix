import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workouts = await query(`
      SELECT
        ws.id,
        ws.name,
        ws.start_time,
        ws.end_time,
        ws.duration_seconds,
        r.name as routine_name,
        ws.routine_id
      FROM "WorkoutSession" ws
      LEFT JOIN "Routine" r ON r.id = ws.routine_id
      WHERE ws.id = $1 AND ws."userId" = $2
    `, [id, session.user.id]);

    if (workouts.length === 0) {
      return NextResponse.json(
        { error: "Workout not found" },
        { status: 404 }
      );
    }

    const w = workouts[0];

    const setsResult = await query(`
      SELECT
        ws.set_number,
        ws.weight,
        ws.reps,
        ws.is_pr,
        e.name as exercise_name
      FROM "WorkoutSet" ws
      JOIN "Exercise" e ON e.id = ws.exercise_id
      WHERE ws.session_id = $1
      ORDER BY ws.set_number ASC
    `, [w.id]);

    const totalVolume = setsResult.reduce(
      (sum: number, s: any) => sum + (s.weight ? s.weight * s.reps : 0),
      0
    );

    const result = {
      id: w.id,
      name: w.name || w.routine_name || "Quick Workout",
      start_time: w.start_time,
      end_time: w.end_time,
      duration_seconds: w.duration_seconds,
      total_sets: setsResult.length,
      total_volume: totalVolume,
      pr_count: setsResult.filter((s: any) => s.is_pr).length,
      exercises: setsResult.map((s: any) => ({
        exerciseName: s.exercise_name,
        weight: s.weight,
        reps: s.reps,
        set_number: s.set_number,
        is_pr: s.is_pr,
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch workout details" },
      { status: 500 }
    );
  }
}
