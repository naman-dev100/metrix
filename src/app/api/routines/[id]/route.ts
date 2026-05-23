import { query, transaction } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, notes, exercises } = body;

    const result = await transaction(async (client: any) => {
      await client.query(
        `UPDATE "Routine" SET name = $1, notes = $2 WHERE id = $3`,
        [name, notes || null, id]
      );

      // Delete existing exercises
      await client.query(`DELETE FROM "RoutineExercise" WHERE routine_id = $1`, [id]);

      // Insert new exercises
      if (exercises?.length) {
        for (let i = 0; i < exercises.length; i++) {
          const setsCount = exercises[i].setsCount || exercises[i].sets_count || 3;
          await client.query(
            `INSERT INTO "RoutineExercise" (id, routine_id, exercise_id, "order", sets_count) VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
            [id, exercises[i].exerciseId, i, setsCount]
          );
        }
      }

      return { id, name, notes, exercises: exercises?.length || 0 };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update routine" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query(`DELETE FROM "Routine" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete routine" },
      { status: 500 }
    );
  }
}
