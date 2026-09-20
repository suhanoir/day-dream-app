import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// Helper to parse "YYYY-MM-DD" or "DD-MM-YYYY" or ISO string into a normalized UTC date
function parseToUtcDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const cleanDate = dateStr.split("T")[0].trim();
  const parts = cleanDate.split("-").map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    if (parts[0] > 1000) {
      // YYYY-MM-DD format
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
    } else if (parts[2] > 1000) {
      // DD-MM-YYYY format
      return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0], 0, 0, 0, 0));
    }
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

// GET /api/todos - List tasks for the authenticated user (isolated by date)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // e.g. "2026-09-04" or "20-09-2026"
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const bucketListItemId = searchParams.get("bucketListItemId");

    const where: any = {
      userId: session.userId,
    };

    if (bucketListItemId) {
      where.bucketListItemId = bucketListItemId;
    }

    if (dateParam) {
      const cleanDate = dateParam.split("T")[0].trim();
      const parts = cleanDate.split("-").map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        const y = parts[0] > 1000 ? parts[0] : parts[2];
        const m = parts[1] - 1;
        const d = parts[0] > 1000 ? parts[2] : parts[0];
        const startOfDay = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));
        where.date = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    if (category && category !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (priority && priority !== "all") {
      where.priority = { equals: priority, mode: "insensitive" };
    }

    const tasks = await (prisma as any).todoTask.findMany({
      where,
      include: {
        bucketListItem: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [
        { completed: "asc" },
        { createdAt: "asc" },
      ],
    });

    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));

    const overdueCount = await (prisma as any).todoTask.count({
      where: {
        userId: session.userId,
        completed: false,
        date: { lt: startOfToday },
      },
    });

    return NextResponse.json({ tasks, overdueCount });
  } catch (error) {
    console.error("Failed to fetch todo tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new To-Do task
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, date, priority, category, bucketListItemId } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const normalizedDate = parseToUtcDate(date || new Date().toISOString());

    const task = await (prisma as any).todoTask.create({
      data: {
        userId: session.userId,
        title: title.trim(),
        description: description?.trim() || null,
        date: normalizedDate,
        priority: priority || "Medium",
        category: category?.trim() || "Personal",
        completed: false,
        bucketListItemId: bucketListItemId || null,
      },
      include: {
        bucketListItem: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ task, todo: task }, { status: 201 });
  } catch (error) {
    console.error("Failed to create todo task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

