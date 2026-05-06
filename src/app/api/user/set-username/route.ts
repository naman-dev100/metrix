import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const trimmed = username.trim();

    if (trimmed.length < 3 || trimmed.length > 20) {
      return NextResponse.json({ error: "Username must be 3-20 characters" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores" }, { status: 400 });
    }

    // Check if username is already taken
    const existing = await prisma.user.findUnique({
      where: { username: trimmed },
    });

    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }

    // Update user's username
    await prisma.user.update({
      where: { id: session.user.id },
      data: { username: trimmed },
    });

    return NextResponse.json({ success: true, username: trimmed });
  } catch (error) {
    console.error("Set username error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
