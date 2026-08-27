import { cookies, headers } from "next/headers";
import { AUTH_COOKIE_NAME, verifyToken, TokenPayload } from "./jwt";
import { prisma } from "../db/prisma";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    const verified = await verifyToken(token);
    if (verified) return verified;
  }

  // Also check Authorization header if present
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const headerToken = authHeader.substring(7);
    const verified = await verifyToken(headerToken);
    if (verified) return verified;
  }

  return null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

