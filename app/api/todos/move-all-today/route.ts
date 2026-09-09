import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// POST /api/todos/move-all-today - Moves all uncompleted to-do items from previous days to today
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Normalized today UTC midnight
    const now = new Date();
    const startOfTodayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));

    // Optional: client can pass fromDate to move from a specific past date, or omit to move all past days
    const body = await req.json().catch(() => ({}));
    const fromDate = body?.fromDate;

    const whereClause: any = {
      userId: session.userId,
      completed: false,
      date: { lt: startOfTodayUtc },
    };

    if (fromDate) {
      const cleanDate = fromDate.split("T")[0];
      const parts = cleanDate.split("-").map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        const startOfFromDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
        const endOfFromDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999));
        whereClause.date = {
          gte: startOfFromDay,
          lte: endOfFromDay,
        };
      }
    }

    // Update all matching uncompleted tasks to today's date
    const result = await (prisma as any).todoTask.updateMany({
      where: whereClause,
      data: {
        date: startOfTodayUtc,
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error("Failed to move all tasks to today:", error);
    return NextResponse.json(
      { error: "Failed to move tasks to today" },
      { status: 500 }
    );
  }
}
