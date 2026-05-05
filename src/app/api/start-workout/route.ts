import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { routineId, name } = body;

    const result = await query(
      `INSERT INTO "WorkoutSession" (id, "userId", routine_id, name) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id`,
      [session.user.id, routineId || null, name || null]
    );

    return NextResponse.json({ sessionId: result[0].id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start workout session" },
      { status: 500 }
    );
  }
}
