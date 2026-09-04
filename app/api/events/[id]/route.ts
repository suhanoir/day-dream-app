import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET /api/events/[id] - Fetch single event
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

    const event = await prisma.event.findFirst({
      where: { id, userId: session.userId },
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

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error: unknown) {
    console.error("Get event error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event." },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event
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
    const body = await req.json();
    const {
      title,
      date,
      startTime,
      endTime,
      location,
      category,
      description,
      reminder,
      bucketListItemId,
    } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Event title cannot be empty." },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.event.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Event not found or unauthorized." },
        { status: 404 }
      );
    }

    let parsedDate = existing.date;
    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "A valid date is required." },
          { status: 400 }
        );
      }
    }

    if (bucketListItemId && bucketListItemId !== existing.bucketListItemId) {
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

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: title.trim(),
        date: parsedDate,
        startTime: startTime !== undefined ? (startTime ? startTime.trim() : null) : existing.startTime,
        endTime: endTime !== undefined ? (endTime ? endTime.trim() : null) : existing.endTime,
        location: location !== undefined ? (location ? location.trim() : null) : existing.location,
        category: category || existing.category,
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
        reminder: reminder !== undefined ? (reminder ? reminder.trim() : "none") : existing.reminder,
        bucketListItemId: bucketListItemId !== undefined ? bucketListItemId : existing.bucketListItemId,
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

    return NextResponse.json({
      message: "Event updated successfully.",
      event: updated,
    });
  } catch (error: unknown) {
    console.error("Update event error:", error);
    return NextResponse.json(
      { error: "Failed to update event." },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event
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

    const existing = await prisma.event.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Event not found or unauthorized." },
        { status: 404 }
      );
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Event deleted successfully.",
    });
  } catch (error: unknown) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event." },
      { status: 500 }
    );
  }
}

