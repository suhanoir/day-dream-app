import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET /api/stats - Calculate comprehensive statistics for current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalGoals, completedGoals, categories, recentCompletions] = await Promise.all([
      prisma.bucketListItem.count({
        where: { userId: session.userId },
      }),
      prisma.bucketListItem.count({
        where: { userId: session.userId, completed: true },
      }),
      prisma.category.findMany({
        where: { userId: session.userId },
        include: {
          items: {
            select: {
              id: true,
              completed: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.bucketListItem.findMany({
        where: {
          userId: session.userId,
          completed: true,
        },
        include: {
          category: {
            select: {
              name: true,
              color: true,
            },
          },
        },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
    ]);

    const remainingGoals = totalGoals - completedGoals;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const categoryBreakdown = categories.map((cat) => {
      const total = cat.items.length;
      const completed = cat.items.filter((i) => i.completed).length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        total,
        completed,
        remaining: total - completed,
        progress,
      };
    });

    return NextResponse.json({
      stats: {
        totalGoals,
        completedGoals,
        remainingGoals,
        completionRate,
        categoryBreakdown,
        recentCompletions,
      },
    });
  } catch (error: unknown) {
    console.error("Fetch stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics." },
      { status: 500 }
    );
  }
}

