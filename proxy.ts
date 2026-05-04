import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/admin/login", "/api/auth/login", "/api/admin/login", "/api/gmail/callback"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (pathname.startsWith("/admin")) {
    if (!session.isLoggedIn || session.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return res;
  }

  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts).*)",
  ],
};
