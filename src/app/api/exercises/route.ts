import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const muscleGroups = searchParams.get("muscle_groups")?.split(",").filter(Boolean) || [];
  const subGroups = searchParams.get("sub_groups")?.split(",").filter(Boolean) || [];
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
  const search = searchParams.get("search");

  try {
    let sql = 'SELECT id, name, category, muscle_group, sub_group, image_url FROM "Exercise" WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Handle multiple muscle groups
    if (muscleGroups.length > 0) {
      const placeholders = muscleGroups.map((_, i) => `$${paramIndex + i}`).join(", ");
      sql += ` AND muscle_group IN (${placeholders})`;
      params.push(...muscleGroups);
      paramIndex += muscleGroups.length;
    }

    // Handle sub-groups (for Arms: Biceps, Triceps, Forearms)
    if (subGroups.length > 0) {
      const placeholders = subGroups.map((_, i) => `$${paramIndex + i}`).join(", ");
      sql += ` AND sub_group IN (${placeholders})`;
      params.push(...subGroups);
      paramIndex += subGroups.length;
    }

    // Handle multiple categories
    if (categories.length > 0) {
      const placeholders = categories.map((_, i) => `$${paramIndex + i}`).join(", ");
      sql += ` AND category IN (${placeholders})`;
      params.push(...categories);
      paramIndex += categories.length;
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
