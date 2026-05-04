import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { createDraft } from "@/lib/gmail";

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.isLoggedIn || !session.gmailAccessToken) {
    return NextResponse.json({ error: "Not authenticated with Gmail" }, { status: 401 });
  }

  const { to, subject, body } = await req.json();

  if (!to || !subject || !body) {
    return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
  }

  try {
    const draftId = await createDraft(to, subject, body, session.gmailAccessToken, session.gmailRefreshToken);
    return NextResponse.json({ ok: true, draftId });
  } catch (err) {
    console.error("Gmail draft error:", err);
    return NextResponse.json({ error: "Failed to create draft" }, { status: 500 });
  }
}
