import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

function parseToUtcDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const cleanDate = dateStr.split("T")[0];
  const parts = cleanDate.split("-").map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
  }
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const category = searchParams.get("category");

    const now = new Date();
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam, 10) : (now.getMonth() + 1);

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const where: any = {
      userId: session.userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    };

    if (category && category !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    const expenses = await (prisma as any).expense.findMany({
      where,
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    const allMonthExpenses = await (prisma as any).expense.findMany({
      where: {
        userId: session.userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const monthlyTotal = allMonthExpenses.reduce((acc: number, item: any) => acc + item.amount, 0);
    const categoryBreakdown: Record<string, number> = {};
    for (const exp of allMonthExpenses) {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    }

    let topCategory: { category: string; amount: number } | null = null;
    for (const [cat, amt] of Object.entries(categoryBreakdown)) {
      if (!topCategory || amt > topCategory.amount) {
        topCategory = { category: cat, amount: amt };
      }
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyAverage = monthlyTotal > 0 ? Number((monthlyTotal / daysInMonth).toFixed(2)) : 0;

    return NextResponse.json({
      expenses,
      monthlyTotal: Number(monthlyTotal.toFixed(2)),
      count: allMonthExpenses.length,
      categoryBreakdown,
      topCategory,
      dailyAverage,
    });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, amount, category, date, notes } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Expense name is required" },
        { status: 400 }
      );
    }

    const parsedAmount = typeof amount === "number" ? amount : parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid amount greater than zero" },
        { status: 400 }
      );
    }

    const normalizedDate = parseToUtcDate(date || new Date().toISOString());

    const expense = await (prisma as any).expense.create({
      data: {
        userId: session.userId,
        title: title.trim(),
        amount: Number(parsedAmount.toFixed(2)),
        category: category?.trim() || "Other",
        date: normalizedDate,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("Failed to create expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
