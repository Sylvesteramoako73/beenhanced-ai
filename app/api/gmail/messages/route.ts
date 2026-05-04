import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { listMessages, getMessage } from "@/lib/gmail";

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.isLoggedIn || !session.gmailAccessToken) {
    return NextResponse.json({ error: "Not authenticated with Gmail" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const message = await getMessage(id, session.gmailAccessToken, session.gmailRefreshToken);
      return NextResponse.json({ message });
    } else {
      const messages = await listMessages(session.gmailAccessToken, session.gmailRefreshToken, 20);
      return NextResponse.json({ messages });
    }
  } catch (err) {
    console.error("Gmail messages error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
