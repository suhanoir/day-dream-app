import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

const JWT_SECRET = process.env.JWT_SECRET || "bucket_list_super_secret_jwt_key_2026_modern_secure_token";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export const AUTH_COOKIE_NAME = "bucket_list_token";

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

