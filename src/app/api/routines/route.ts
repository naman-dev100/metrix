import { query, transaction } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const routines = await query(`
      SELECT 
        r.id, 
        r.name, 
        r.notes, 
        r.created_at,
        COALESCE(json_agg(
          json_build_object(
            'id', e.id,
            'exercise', json_build_object(
              'id', e.id,
              'name', e.name,
              'muscle_group', e.muscle_group,
              'category', e.category
            ),
            'order', re.order,
            'sets_count', re.sets_count
          )
          ORDER BY re.order ASC
        ) FILTER (WHERE re.id IS NOT NULL), '[]') as "routineExercises"
      FROM "Routine" r
      LEFT JOIN "RoutineExercise" re ON re.routine_id = r.id
      LEFT JOIN "Exercise" e ON e.id = re.exercise_id
      WHERE r."userId" = $1
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `, [session.user.id]);

    return NextResponse.json(routines);
  } catch (error) {
    console.error("Error in GET /api/routines:", error);
    return NextResponse.json(
      { error: "Failed to fetch routines" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
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
          const setsCount = exercises[i].setsCount || exercises[i].sets_count || 3;
          await client.query(
            `INSERT INTO "RoutineExercise" (id, routine_id, exercise_id, "order", sets_count) VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
            [routine.id, exercises[i].exerciseId, i, setsCount]
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
          sets_count: ex.setsCount || ex.sets_count || 3,
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
