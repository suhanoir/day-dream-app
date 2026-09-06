import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isMaintenanceMode } from "./lib/config/maintenance";

export function middleware(request: NextRequest) {
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
