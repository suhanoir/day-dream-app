import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET /api/bucket-list/[id] - Get single item
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const item = await prisma.bucketListItem.findFirst({
      where: {
        id,
        userId: session.userId,
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

    if (!item) {
      return NextResponse.json(
        { error: "Bucket list item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error: unknown) {
    console.error("Get bucket list item error:", error);
    return NextResponse.json(
      { error: "Failed to fetch item." },
      { status: 500 }
    );
  }
}

// PUT /api/bucket-list/[id] - Update item (title, description, categoryId, targetDate)
export async function PUT(
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
    const { title, categoryId, description, targetDate } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title cannot be empty." },
        { status: 400 }
      );
    }

    // Verify item ownership
    const existing = await prisma.bucketListItem.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bucket list item not found or unauthorized." },
        { status: 404 }
      );
    }

    // If changing category, verify category belongs to user
    if (categoryId && categoryId !== existing.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: session.userId,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Invalid category selected." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.bucketListItem.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
        categoryId: categoryId || existing.categoryId,
        targetDate: targetDate !== undefined ? (targetDate ? new Date(targetDate) : null) : existing.targetDate,
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
      message: "Goal updated successfully.",
      item: updated,
    });
  } catch (error: unknown) {
    console.error("Update bucket list item error:", error);
    return NextResponse.json(
      { error: "Failed to update item." },
      { status: 500 }
    );
  }
}

// DELETE /api/bucket-list/[id] - Delete item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.bucketListItem.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bucket list item not found or unauthorized." },
        { status: 404 }
      );
    }

    await prisma.bucketListItem.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Goal removed from your bucket list.",
    });
  } catch (error: unknown) {
    console.error("Delete bucket list item error:", error);
    return NextResponse.json(
      { error: "Failed to delete item." },
      { status: 500 }
    );
  }
}

