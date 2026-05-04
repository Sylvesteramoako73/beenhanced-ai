import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { supabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.isLoggedIn || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { revoke } = await req.json();

  await supabase
    .from("admin_settings")
    .upsert({ id: "main", access_revoked: revoke, updated_at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
