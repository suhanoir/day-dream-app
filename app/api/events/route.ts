import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET /api/events - List events with search, category, month, and timeline filters
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const filter = searchParams.get("filter")?.trim().toLowerCase() || "all";
    const month = searchParams.get("month")?.trim() || ""; // Format: "YYYY-MM"

    const where: any = {
      userId: session.userId,
    };

    if (category && category !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    // Date / Timeline filters
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (filter === "today") {
      where.date = {
        gte: startOfToday,
        lte: endOfToday,
      };
    } else if (filter === "upcoming") {
      where.date = {
        gte: startOfToday,
      };
    } else if (filter === "past") {
      where.date = {
        lt: startOfToday,
      };
    }

    // Month filter (e.g. "2026-09")
    if (month && filter === "all") {
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const monthIndex = parseInt(monthStr, 10) - 1;

      if (!isNaN(year) && !isNaN(monthIndex)) {
        const startOfMonth = new Date(year, monthIndex, 1);
        const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
        where.date = {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      }
    }

    // Search query
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        bucketListItem: {
          select: {
            id: true,
            title: true,
            completed: true,
          },
        },
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({ events });
  } catch (error: unknown) {
    console.error("Fetch events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events." },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      date,
      startTime,
      endTime,
      location,
      category,
      description,
      bucketListItemId,
    } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Event title is required." },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Event date is required." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "A valid date is required." },
        { status: 400 }
      );
    }

    // If bucketListItemId is provided, verify ownership
    if (bucketListItemId) {
      const item = await prisma.bucketListItem.findFirst({
        where: { id: bucketListItemId, userId: session.userId },
      });
      if (!item) {
        return NextResponse.json(
          { error: "Invalid bucket list item selected." },
          { status: 400 }
        );
      }
    }

    const event = await prisma.event.create({
      data: {
        userId: session.userId,
        title: title.trim(),
        date: parsedDate,
        startTime: startTime ? startTime.trim() : null,
        endTime: endTime ? endTime.trim() : null,
        location: location ? location.trim() : null,
        category: category ? category.trim() : "Personal",
        description: description ? description.trim() : null,
        reminder: "none",
        bucketListItemId: bucketListItemId || null,
      },
      include: {
        bucketListItem: {
          select: {
            id: true,
            title: true,
            completed: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Event added to your calendar.",
        event,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Failed to create event." },
      { status: 500 }
    );
  }
}

