import { query, transaction } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const routines = await query(`
      SELECT r.id, r.name, r.notes, r.created_at,
             re.id as exercise_id, re.order,
             e.name as exercise_name, e.muscle_group, e.category
      FROM "Routine" r
      LEFT JOIN "RoutineExercise" re ON re.routine_id = r.id
      LEFT JOIN "Exercise" e ON e.id = re.exercise_id
      WHERE r."userId" = $1
      ORDER BY r.created_at DESC, re.order ASC
    `, [session.user.id]);

    // Group by routine
    const grouped: any[] = [];
    for (const row of routines) {
      let routine = grouped.find((r: any) => r.id === row.id);
      if (!routine) {
        routine = {
          id: row.id,
          name: row.name,
          notes: row.notes,
          created_at: row.created_at,
          routineExercises: [],
        };
        grouped.push(routine);
      }
      if (row.exercise_id) {
        routine.routineExercises.push({
          id: row.exercise_id,
          exercise: {
            id: row.exercise_id,
            name: row.exercise_name,
            muscle_group: row.muscle_group,
            category: row.category,
          },
          order: row.order,
        });
      }
    }

    return NextResponse.json(grouped);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch routines" },
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
    const { name, notes, exercises } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Routine name is required" },
        { status: 400 }
      );
    }

    const result = await transaction(async (client: any) => {
      const routineResult = await client.query(
        `INSERT INTO "Routine" (id, "userId", name, notes) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id, name, notes, created_at`,
        [session.user.id, name, notes || null]
      );
      const routine = routineResult.rows[0];

      if (exercises?.length) {
        for (let i = 0; i < exercises.length; i++) {
          await client.query(
            `INSERT INTO "RoutineExercise" (id, routine_id, exercise_id, "order") VALUES (gen_random_uuid(), $1, $2, $3)`,
            [routine.id, exercises[i].exerciseId, i]
          );
        }
      }

      return {
        ...routine,
        routineExercises: exercises?.map((ex: any, i: number) => ({
          id: `re-${i}`,
          exercise: {
            id: ex.exerciseId,
            name: "",
            muscle_group: "",
            category: "",
          },
          order: i,
        })) || [],
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create routine" },
      { status: 500 }
    );
  }
}
