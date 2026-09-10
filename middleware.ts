import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isMaintenanceMode } from "./lib/config/maintenance";
import { verifyToken, AUTH_COOKIE_NAME } from "./lib/auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const maintenanceActive = isMaintenanceMode();

  if (maintenanceActive) {
    // Return 503 Service Unavailable for API requests
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        {
          error: "DayDream is temporarily under maintenance. Please try again soon.",
          maintenance: true,
        },
        { status: 503 }
      );
    }

    // Rewrite all web pages to /maintenance while preserving the browser URL
    if (pathname !== "/maintenance") {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // If maintenance is OFF, redirect any direct visits to /maintenance back to home
  if (pathname === "/maintenance") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Check auth state via secure JWT cookie
  const tokenCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = tokenCookie ? await verifyToken(tokenCookie) : null;
  const isAuthenticated = Boolean(user);

  // 1. Root URL (/)
  if (pathname === "/") {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2. Auth Pages (/login, /register)
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. Protected Inner Sections
  const normalizedPath = pathname.replace(/\/$/, "");
  const INNER_SECTIONS = [
    "/dashboard",
    "/calendar",
    "/todo",
    "/to-do-list",
    "/expenses",
  ];
  const isInnerSection = INNER_SECTIONS.includes(normalizedPath);

  if (isInnerSection) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Determine if this is an in-app client-side navigation (RSC fetch)
    const isRscRequest = Boolean(
      request.headers.get("rsc") ||
      request.headers.get("next-router-prefetch") ||
      request.headers.get("next-router-state-tree") ||
      request.headers.get("next-url") ||
      request.nextUrl.searchParams.has("_rsc")
    );

    // Full document navigation (fresh launch, reopened browser tab, page refresh)
    const isDocumentNavigation =
      !isRscRequest &&
      (request.headers.get("sec-fetch-dest") === "document" ||
       request.headers.get("accept")?.includes("text/html"));

    // Check for deep-link query parameters (e.g. ?event=..., ?date=..., ?task=...)
    const searchParams = new URLSearchParams(request.nextUrl.search);
    searchParams.delete("_rsc");
    const hasDeepLinkQuery = searchParams.toString().length > 0;

    // Fresh application startup/reopen/refresh on an inner section:
    // Redirect cleanly to /home before rendering to eliminate visual flash.
    if (isDocumentNavigation && !isRscRequest && !hasDeepLinkQuery) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // 4. Protected Home page
  if (pathname === "/home") {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg (vector logo)
     * - manifest.json (PWA manifest)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json).*)",
  ],
};
