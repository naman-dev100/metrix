import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const muscleGroup = searchParams.get("muscle_group");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  try {
    let sql = 'SELECT id, name, category, muscle_group, image_url FROM "Exercise" WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (muscleGroup) {
      sql += ` AND muscle_group = $${paramIndex++}`;
      params.push(muscleGroup);
    }
    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (search) {
      sql += ` AND name ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY name ASC';

    const exercises = await query(sql, params);
    return NextResponse.json(exercises);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}
