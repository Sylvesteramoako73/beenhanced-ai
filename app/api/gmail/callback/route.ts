import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { createOAuthClient } from "@/lib/gmail";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/chat?gmail=error", req.url));
  }

  const res = NextResponse.redirect(new URL("/chat?gmail=connected", req.url));
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: client });
    const profile = await gmail.users.getProfile({ userId: "me" });

    session.gmailAccessToken = tokens.access_token ?? undefined;
    session.gmailRefreshToken = tokens.refresh_token ?? undefined;
    session.gmailEmail = profile.data.emailAddress ?? undefined;
    await session.save();
  } catch (err) {
    console.error("Gmail OAuth error:", err);
    return NextResponse.redirect(new URL("/chat?gmail=error", req.url));
  }

  return res;
}
