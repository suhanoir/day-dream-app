import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// PUT /api/categories/[id] - Update a category
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
    const { name, description, color, icon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Verify ownership
    const existing = await prisma.category.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found or unauthorized." },
        { status: 404 }
      );
    }

    // Check if renaming to another existing category name
    if (trimmedName.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await prisma.category.findUnique({
        where: {
          userId_name: {
            userId: session.userId,
            name: trimmedName,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `Another category named "${trimmedName}" already exists.` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: trimmedName,
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
        color: color || existing.color,
        icon: icon || existing.icon,
      },
    });

    return NextResponse.json({
      message: "Category updated successfully.",
      category: updated,
    });
  } catch (error: unknown) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Failed to update category." },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
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

    // Verify ownership
    const existing = await prisma.category.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found or unauthorized." },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Category deleted successfully.",
    });
  } catch (error: unknown) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}

