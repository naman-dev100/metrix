import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the log belongs to the user
    const logs = await query(
      `DELETE FROM "BodyWeightLog" 
       WHERE id = $1 AND "userId" = $2 
       RETURNING id`,
      [id, session.user.id]
    );

    if (logs.length === 0) {
      return NextResponse.json(
        { error: "Weight log not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Error deleting weight log:", error);
    return NextResponse.json(
      { error: "Failed to delete weight log" },
      { status: 500 }
    );
  }
}
