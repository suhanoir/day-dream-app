import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// PATCH /api/todos/[id]/move-today - Move task to today's date
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingTask = await (prisma as any).todoTask.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Normalized today UTC midnight
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));

    const updatedTask = await (prisma as any).todoTask.update({
      where: { id },
      data: {
        date: todayUtc,
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Failed to move task to today:", error);
    return NextResponse.json(
      { error: "Failed to move task to today" },
      { status: 500 }
    );
  }
}

