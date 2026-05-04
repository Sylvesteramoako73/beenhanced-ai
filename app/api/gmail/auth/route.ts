import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { getAuthUrl } from "@/lib/gmail";

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const url = getAuthUrl();
  return NextResponse.redirect(url);
}
