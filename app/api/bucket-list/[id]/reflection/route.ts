import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// PATCH /api/bucket-list/[id]/reflection - Save or update reflection/memory notes
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
    const body = await req.json();
    const { reflection } = body;

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

    const updated = await prisma.bucketListItem.update({
      where: { id },
      data: {
        reflection: typeof reflection === "string" ? reflection.trim() : null,
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
      message: "Your reflection has been permanently saved.",
      item: updated,
    });
  } catch (error: unknown) {
    console.error("Save reflection error:", error);
    return NextResponse.json(
      { error: "Failed to save reflection." },
      { status: 500 }
    );
  }
}

