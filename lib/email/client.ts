import { Resend } from "resend";

const apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export const DEFAULT_EMAIL_FROM =
  process.env.EMAIL_FROM || "DayDream <onboarding@resend.dev>";

export function getAppUrl(): string {
  const url = process.env.APP_URL || "http://localhost:3000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function isEmailConfigured(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

