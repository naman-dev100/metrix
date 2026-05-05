import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await query(`
      SELECT id, weight, date, notes
      FROM "BodyWeightLog"
      WHERE "userId" = $1
      ORDER BY date ASC
      LIMIT 365
    `, [session.user.id]);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch body weight logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weight, date, notes } = body;

    if (!weight) {
      return NextResponse.json(
        { error: "Weight is required" },
        { status: 400 }
      );
    }

    const dateValue = date ? new Date(date) : new Date();
    const result = await query(
      `INSERT INTO "BodyWeightLog" (id, "userId", weight, date, notes) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING id, weight, date, notes`,
      [session.user.id, weight, dateValue, notes || null]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save body weight log" },
      { status: 500 }
    );
  }
}
