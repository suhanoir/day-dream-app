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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const expense = await (prisma as any).expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    if (expense.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error("Failed to fetch expense:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

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
    const existing = await (prisma as any).expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    if (existing.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, amount, category, date, notes } = body;

    const dataToUpdate: any = {};
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      dataToUpdate.title = title.trim();
    }
    if (amount !== undefined) {
      const parsed = typeof amount === "number" ? amount : parseFloat(amount);
      if (isNaN(parsed) || parsed <= 0) {
        return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
      }
      dataToUpdate.amount = Number(parsed.toFixed(2));
    }
    if (category !== undefined) {
      dataToUpdate.category = category?.trim() || "Other";
    }
    if (date !== undefined) {
      dataToUpdate.date = parseToUtcDate(date);
    }
    if (notes !== undefined) {
      dataToUpdate.notes = notes?.trim() || null;
    }

    const updatedExpense = await (prisma as any).expense.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ expense: updatedExpense });
  } catch (error) {
    console.error("Failed to update expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

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
    const existing = await (prisma as any).expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    if (existing.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await (prisma as any).expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
