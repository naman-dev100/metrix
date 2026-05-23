import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query for the sets from the very last completed workout session containing this exercise
    const previousSets = await query(`
      WITH last_session AS (
        SELECT ws.session_id
        FROM "WorkoutSet" ws
        JOIN "WorkoutSession" wss ON wss.id = ws.session_id
        WHERE wss."userId" = $1 AND ws.exercise_id = $2 AND wss.end_time IS NOT NULL
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
      ORDER BY ws.set_number ASC
    `, [session.user.id, id]);

    // Query for the all-time maximum set for this exercise
    const allTimeMaxResult = await query(`
      SELECT ws.weight, ws.reps 
      FROM "WorkoutSet" ws
      JOIN "WorkoutSession" wss ON wss.id = ws.session_id
      WHERE wss."userId" = $1 AND ws.exercise_id = $2 AND wss.end_time IS NOT NULL
      ORDER BY ws.weight DESC NULLS LAST, ws.reps DESC
      LIMIT 1
    `, [session.user.id, id]);

    const allTimeMax = allTimeMaxResult[0] || null;

    return NextResponse.json({
      previousSets,
      allTimeMax
    });
  } catch (error) {
    console.error("Error in GET /api/exercises/[id]/previous:", error);
    return NextResponse.json(
      { error: "Failed to fetch previous exercise data" },
      { status: 500 }
    );
  }
}

