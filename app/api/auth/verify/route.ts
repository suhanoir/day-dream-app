import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return NextResponse.redirect(new URL("/verify?status=invalid", req.url));
    }

    const cleanToken = token.trim();

    // Look up token in database
    const tokenRecord = await (prisma as any).verificationToken.findUnique({
      where: { token: cleanToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      return NextResponse.redirect(new URL("/verify?status=invalid", req.url));
    }

    // Check expiration
    if (new Date() > new Date(tokenRecord.expiresAt)) {
      // Token has expired; remove it
      await (prisma as any).verificationToken.delete({
        where: { id: tokenRecord.id },
      }).catch(() => {});

      const emailParam = tokenRecord.user?.email ? `&email=${encodeURIComponent(tokenRecord.user.email)}` : "";
      return NextResponse.redirect(new URL(`/verify?status=expired${emailParam}`, req.url));
    }

    // Valid token: update user emailVerified to true
    await (prisma as any).user.update({
      where: { id: tokenRecord.userId },
      data: { emailVerified: true },
    });

    // Delete used token (single-use)
    await (prisma as any).verificationToken.delete({
      where: { id: tokenRecord.id },
    }).catch(() => {});

    return NextResponse.redirect(new URL("/verify?status=success", req.url));
  } catch (error: unknown) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/verify?status=error", req.url));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const tokenRecord = await (prisma as any).verificationToken.findUnique({
      where: { token: token.trim() },
      include: { user: true },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired verification token." }, { status: 400 });
    }

    if (new Date() > new Date(tokenRecord.expiresAt)) {
      await (prisma as any).verificationToken.delete({
        where: { id: tokenRecord.id },
      }).catch(() => {});

      return NextResponse.json(
        { error: "Verification token has expired. Please request a new link." },
        { status: 410 }
      );
    }

    await (prisma as any).user.update({
      where: { id: tokenRecord.userId },
      data: { emailVerified: true },
    });

    await (prisma as any).verificationToken.delete({
      where: { id: tokenRecord.id },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error: unknown) {
    console.error("Verification POST error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification." },
      { status: 500 }
    );
  }
}

