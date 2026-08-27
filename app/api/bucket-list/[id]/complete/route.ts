import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// PATCH /api/bucket-list/[id]/complete - Mark completed or active
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
    const body = await req.json().catch(() => ({}));
    const { completed, reflection } = body;

    const existing = await prisma.bucketListItem.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bucket list item not found." },
        { status: 404 }
      );
    }

    // If completed is not passed explicitly, toggle current state
    const newCompleted = typeof completed === "boolean" ? completed : !existing.completed;
    const completedAt = newCompleted ? (existing.completedAt || new Date()) : null;

    const updated = await prisma.bucketListItem.update({
      where: { id },
      data: {
        completed: newCompleted,
        completedAt,
        reflection: reflection !== undefined ? reflection : existing.reflection,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: newCompleted
        ? "Congratulations! Goal marked as completed."
        : "Goal moved back to active.",
      item: updated,
    });
  } catch (error: unknown) {
    console.error("Complete item error:", error);
    return NextResponse.json(
      { error: "Failed to update completion status." },
      { status: 500 }
    );
  }
}

