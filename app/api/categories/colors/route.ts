import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  DEFAULT_CATEGORY_COLORS,
  CORE_TODO_CATEGORIES,
  getDefaultColorForCategory,
  normalizeHexColor,
} from "@/lib/utils/categoryColors";

// GET /api/categories/colors - Retrieve all resolved category colors for the current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Initialize with default colors
    const colors: Record<string, string> = { ...DEFAULT_CATEGORY_COLORS };

    // 2. Query user's categories from DB
    const userCategories = await prisma.category.findMany({
      where: { userId: session.userId },
      select: { name: true, color: true },
    });

    for (const cat of userCategories) {
      if (cat.name && cat.color) {
        colors[cat.name] = normalizeHexColor(cat.color);
      }
    }

    // 3. Find any distinct categories from todos or events
    const [todoCategories, eventCategories] = await Promise.all([
      prisma.todoTask.findMany({
        where: { userId: session.userId, category: { not: null } },
        select: { category: true },
        distinct: ["category"],
      }),
      prisma.event.findMany({
        where: { userId: session.userId },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    for (const t of todoCategories) {
      if (t.category && !colors[t.category]) {
        colors[t.category] = getDefaultColorForCategory(t.category);
      }
    }

    for (const e of eventCategories) {
      if (e.category && !colors[e.category]) {
        colors[e.category] = getDefaultColorForCategory(e.category);
      }
    }

    // 4. Ensure all core TODO categories exist
    for (const core of CORE_TODO_CATEGORIES) {
      if (!colors[core]) {
        colors[core] = getDefaultColorForCategory(core);
      }
    }

    return NextResponse.json({ colors });
  } catch (error: unknown) {
    console.error("Fetch category colors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category colors." },
      { status: 500 }
    );
  }
}

// PUT /api/categories/colors - Update or reset a category color
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, color, reset } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (reset) {
      const defaultColor = getDefaultColorForCategory(trimmedName);
      // If category exists in db, update to default
      const existing = await prisma.category.findUnique({
        where: {
          userId_name: {
            userId: session.userId,
            name: trimmedName,
          },
        },
      });

      if (existing) {
        await prisma.category.update({
          where: { id: existing.id },
          data: { color: defaultColor },
        });
      }

      return NextResponse.json({
        message: `Category "${trimmedName}" color reset to default.`,
        name: trimmedName,
        color: defaultColor,
      });
    }

    if (!color || typeof color !== "string") {
      return NextResponse.json(
        { error: "Color is required." },
        { status: 400 }
      );
    }

    const normalized = normalizeHexColor(color);

    // Upsert into category table
    await prisma.category.upsert({
      where: {
        userId_name: {
          userId: session.userId,
          name: trimmedName,
        },
      },
      update: {
        color: normalized,
      },
      create: {
        userId: session.userId,
        name: trimmedName,
        color: normalized,
      },
    });

    return NextResponse.json({
      message: `Category "${trimmedName}" color updated.`,
      name: trimmedName,
      color: normalized,
    });
  } catch (error: unknown) {
    console.error("Update category color error:", error);
    return NextResponse.json(
      { error: "Failed to update category color." },
      { status: 500 }
    );
  }
}

