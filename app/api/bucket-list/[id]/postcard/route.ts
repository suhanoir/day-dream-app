import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// PATCH /api/bucket-list/[id]/postcard - Save or update postcard settings (photo, style, reflection)
export async function PATCH(
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
    const { memoryPhoto, memoryPhotos, postcardStyle, reflection } = body;

    // Verify ownership
    const existing = await prisma.bucketListItem.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bucket list item not found or unauthorized." },
        { status: 404 }
      );
    }

    const data: {
      memoryPhoto?: string | null;
      memoryPhotos?: string | null;
      postcardStyle?: string | null;
      reflection?: string | null;
    } = {};

    if (memoryPhotos !== undefined) {
      if (Array.isArray(memoryPhotos)) {
        data.memoryPhotos = memoryPhotos.length > 0 ? JSON.stringify(memoryPhotos) : null;
      } else if (typeof memoryPhotos === "string" && memoryPhotos.trim()) {
        data.memoryPhotos = memoryPhotos;
      } else {
        data.memoryPhotos = null;
      }
    }

    if (memoryPhoto !== undefined) {
      data.memoryPhoto = typeof memoryPhoto === "string" && memoryPhoto.trim() ? memoryPhoto : null;
    } else if (data.memoryPhotos) {
      try {
        const parsed = JSON.parse(data.memoryPhotos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          data.memoryPhoto = parsed[0];
        }
      } catch {
        // ignore json parse error
      }
    }

    if (postcardStyle !== undefined) {
      data.postcardStyle = typeof postcardStyle === "string" ? postcardStyle : "polaroid";
    }

    if (reflection !== undefined) {
      data.reflection = typeof reflection === "string" ? reflection.trim() : null;
    }

    const updated = await prisma.bucketListItem.update({
      where: { id },
      data,
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

    return NextResponse.json({
      message: "Memory postcard updated successfully.",
      item: updated,
    });
  } catch (error: unknown) {
    console.error("Save memory postcard error:", error);
    return NextResponse.json(
      { error: "Failed to save memory postcard." },
      { status: 500 }
    );
  }
}
