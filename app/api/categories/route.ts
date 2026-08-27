import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET /api/categories - List user's categories with item counts
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.userId },
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          select: {
            id: true,
            completed: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formattedCategories = categories.map((cat) => {
      const totalItems = cat.items.length;
      const completedItems = cat.items.filter((item) => item.completed).length;
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        totalItems,
        completedItems,
        progress,
      };
    });

    return NextResponse.json({ categories: formattedCategories });
  } catch (error: unknown) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, color, icon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if category name already exists for this user
    const existing = await prisma.category.findUnique({
      where: {
        userId_name: {
          userId: session.userId,
          name: trimmedName,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Category "${trimmedName}" already exists.` },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        userId: session.userId,
        name: trimmedName,
        description: description ? description.trim() : null,
        color: color || "emerald",
        icon: icon || "tag",
      },
    });

    return NextResponse.json(
      {
        message: "Category created successfully.",
        category: {
          ...category,
          totalItems: 0,
          completedItems: 0,
          progress: 0,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 }
    );
  }
}

