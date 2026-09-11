import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // Optional client local date: "YYYY-MM-DD"

    const now = new Date();
    let startOfDay: Date;
    let endOfDay: Date;
    let currentYear: number;
    let currentMonth: number;

    if (dateParam && dateParam.includes("-")) {
      const parts = dateParam.split("T")[0].split("-").map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        currentYear = parts[0];
        currentMonth = parts[1]; // 1-12
        startOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
        endOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999));
      } else {
        currentYear = now.getFullYear();
        currentMonth = now.getMonth() + 1;
        startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      }
    } else {
      currentYear = now.getFullYear();
      currentMonth = now.getMonth() + 1;
      startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    }

    // Month boundary for expenses
    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));

    // Parallel fetch for optimal speed and zero redundant requests
    const [
      todayTasks,
      todayEvents,
      activeGoal,
      activeGoalsCount,
      completedGoalsCount,
      monthExpenses,
    ] = await Promise.all([
      // 1. Today's Tasks
      (prisma as any).todoTask.findMany({
        where: {
          userId: session.userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: [
          { completed: "asc" },
          { createdAt: "asc" },
        ],
      }),

      // 2. Today's Events
      prisma.event.findMany({
        where: {
          userId: session.userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: [
          { startTime: "asc" },
          { createdAt: "asc" },
        ],
      }),

      // 3. Highlight 1 active bucket-list goal (prefer one with target date, otherwise latest)
      prisma.bucketListItem.findFirst({
        where: {
          userId: session.userId,
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
        orderBy: [
          { targetDate: "asc" },
          { createdAt: "desc" },
        ],
      }),

      // 4. Active goals count
      prisma.bucketListItem.count({
        where: {
          userId: session.userId,
          completed: false,
        },
      }),

      // 5. Completed goals count
      prisma.bucketListItem.count({
        where: {
          userId: session.userId,
          completed: true,
        },
      }),

      // 6. Current month expenses
      (prisma as any).expense.findMany({
        where: {
          userId: session.userId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    // Calculate Task metrics
    const tasksTotal = todayTasks.length;
    const tasksCompleted = todayTasks.filter((t: any) => t.completed).length;
    const tasksRemaining = tasksTotal - tasksCompleted;
    const tasksPercent = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

    // Calculate Expense metrics
    const monthlyExpenseTotal = monthExpenses.reduce(
      (acc: number, item: any) => acc + (Number(item.amount) || 0),
      0
    );
    const monthlyExpenseCount = monthExpenses.length;

    // Identify top expense category this month
    const categorySpendMap: Record<string, number> = {};
    monthExpenses.forEach((exp: any) => {
      const cat = exp.category || "Other";
      categorySpendMap[cat] = (categorySpendMap[cat] || 0) + (Number(exp.amount) || 0);
    });

    let topExpenseCategory: string | null = null;
    let topExpenseCategoryAmount = 0;
    Object.entries(categorySpendMap).forEach(([cat, amount]) => {
      if (amount > topExpenseCategoryAmount) {
        topExpenseCategoryAmount = amount;
        topExpenseCategory = cat;
      }
    });

    // Derive Today's Focus (Max 3 items prioritized)
    // Priority:
    // 1. Uncompleted High priority tasks
    // 2. Uncompleted Medium priority tasks
    // 3. Uncompleted Low/other tasks
    // 4. Today's Events
    const uncompletedTasks = todayTasks.filter((t: any) => !t.completed);
    const priorityWeight: Record<string, number> = {
      urgent: 3,
      high: 3,
      medium: 2,
      low: 1,
    };

    const sortedUncompletedTasks = [...uncompletedTasks].sort((a: any, b: any) => {
      const weightA = priorityWeight[a.priority?.toLowerCase() || ""] || 2;
      const weightB = priorityWeight[b.priority?.toLowerCase() || ""] || 2;
      if (weightB !== weightA) return weightB - weightA;
      return 0;
    });

    const focusItems: Array<{
      id: string;
      type: "task" | "event";
      title: string;
      time?: string | null;
      priority?: string | null;
      category?: string | null;
      completed?: boolean;
      location?: string | null;
    }> = [];

    // Add top uncompleted tasks
    for (const task of sortedUncompletedTasks) {
      if (focusItems.length >= 3) break;
      focusItems.push({
        id: task.id,
        type: "task",
        title: task.title,
        time: null,
        priority: task.priority,
        category: task.category,
        completed: task.completed,
      });
    }

    // Fill remaining slots with today's events if room allows
    for (const event of todayEvents) {
      if (focusItems.length >= 3) break;
      focusItems.push({
        id: event.id,
        type: "event",
        title: event.title,
        time: event.startTime ? (event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime) : null,
        category: event.category,
        location: event.location,
      });
    }

    // Month name formatted
    const monthDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const monthName = monthDate.toLocaleDateString("en-US", { month: "long" });

    return NextResponse.json({
      overview: {
        tasksRemaining,
        tasksCompleted,
        tasksTotal,
        tasksPercent,
        eventsCount: todayEvents.length,
        activeGoalsCount,
        completedGoalsCount,
        monthlyExpenseTotal,
        monthlyExpenseCount,
      },
      focusItems,
      dreamInProgress: activeGoal,
      todayEvents: todayEvents.slice(0, 3), // Preview up to 3 events
      todayTasksSummary: {
        remaining: tasksRemaining,
        completed: tasksCompleted,
        total: tasksTotal,
        percent: tasksPercent,
      },
      expensesSummary: {
        monthlyTotal: monthlyExpenseTotal,
        count: monthlyExpenseCount,
        topCategory: topExpenseCategory,
        topCategoryAmount: topExpenseCategoryAmount,
        monthName,
        year: currentYear,
      },
    });
  } catch (error) {
    console.error("Home API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch home data." },
      { status: 500 }
    );
  }
}

