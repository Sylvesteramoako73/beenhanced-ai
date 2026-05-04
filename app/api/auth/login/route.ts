import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

const USERS: Record<string, string> = {
  sylvester: process.env.SYLVESTER_PASSWORD ?? "",
  emily: process.env.EMILY_PASSWORD ?? "",
};

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const userId = Object.entries(USERS).find(([, pw]) => pw && pw === password)?.[0];

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.isLoggedIn = true;
  session.role = "user";
  session.userId = userId;
  await session.save();

  return res;
}
