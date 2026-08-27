import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET /api/bucket-list - List items with search, category, and status filters
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const categoryId = searchParams.get("categoryId")?.trim() || "";
    const status = searchParams.get("status")?.trim().toLowerCase() || "all";

    // Build filter conditions
    const where: any = {
      userId: session.userId,
    };

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    if (status === "active") {
      where.completed = false;
    } else if (status === "completed") {
      where.completed = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { reflection: { contains: search } },
      ];
    }

    const items = await prisma.bucketListItem.findMany({
      where,
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
      orderBy: [
        { completed: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ items });
  } catch (error: unknown) {
    console.error("Fetch bucket list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bucket list items." },
      { status: 500 }
    );
  }
}

// POST /api/bucket-list - Create a new bucket list item
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, categoryId, description, targetDate } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Bucket list item title is required." },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "Please select a category for this goal." },
        { status: 400 }
      );
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.userId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category or unauthorized." },
        { status: 400 }
      );
    }

    const item = await prisma.bucketListItem.create({
      data: {
        userId: session.userId,
        categoryId,
        title: title.trim(),
        description: description ? description.trim() : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        completed: false,
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

    return NextResponse.json(
      {
        message: "Goal added to your bucket list.",
        item,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create bucket list item error:", error);
    return NextResponse.json(
      { error: "Failed to create bucket list item." },
      { status: 500 }
    );
  }
}

