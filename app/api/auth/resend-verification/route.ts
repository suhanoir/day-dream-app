import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { sendVerificationEmail } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  try {
    let targetUserId: string | null = null;
    let targetEmail: string | null = null;

    // Check if user is logged in
    const session = await getSession();
    if (session?.userId) {
      targetUserId = session.userId;
    }

    // Otherwise check body for email
    if (!targetUserId) {
      const body = await req.json().catch(() => ({}));
      if (body.email && typeof body.email === "string") {
        targetEmail = body.email.trim().toLowerCase();
      }
    }

    if (!targetUserId && !targetEmail) {
      return NextResponse.json(
        { error: "Please log in or provide an email address." },
        { status: 400 }
      );
    }

    const user = await (prisma as any).user.findFirst({
      where: targetUserId ? { id: targetUserId } : { email: targetEmail },
    });

    if (!user) {
      // Don't leak account existence if unauthenticated
      return NextResponse.json({
        success: true,
        message: "If an unverified account exists with that email, a verification link has been sent.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Your email address is already verified." },
        { status: 400 }
      );
    }

    // Invalidate existing tokens for this user
    await (prisma as any).verificationToken.deleteMany({
      where: { userId: user.id },
    }).catch(() => {});

    // Generate new 32-byte token expiring in 24 hours
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await (prisma as any).verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send the email
    const sendResult = await sendVerificationEmail({
      name: user.name,
      email: user.email,
      token,
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
      simulated: sendResult.simulated,
    });
  } catch (error: unknown) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email. Please try again." },
      { status: 500 }
    );
  }
}

