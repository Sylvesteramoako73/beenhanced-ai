import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { anthropic, MODEL, buildSystemPrompt, isOffTopicRefusal } from "@/lib/anthropic";
import type { ContextKey } from "@/lib/anthropic";
import { logMessage, getAdminSettings, isAccessRevoked, getRateLimitCount } from "@/lib/db";
import crypto from "crypto";

const RATE_LIMIT = 30; // max user messages per minute

export async function POST(req: NextRequest) {
  // Auth check
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Access revocation
  if (await isAccessRevoked()) {
    return NextResponse.json({ error: "Access suspended. Contact your administrator." }, { status: 403 });
  }

  // Rate limiting
  const count = await getRateLimitCount(1);
  if (count >= RATE_LIMIT) {
    return NextResponse.json({ error: "Rate limit reached. Please wait a moment before sending more messages." }, { status: 429 });
  }

  const { messages, context }: { messages: { role: "user" | "assistant"; content: string }[]; context: ContextKey } =
    await req.json();

  if (!messages?.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  // Fetch admin settings for additional restrictions
  const settings = await getAdminSettings();
  const systemPrompt = buildSystemPrompt(context ?? "general", settings?.additional_restrictions ?? "");

  const sessionId = (session as any).sessionId ?? crypto.randomUUID();

  // Log user message
  const lastUserMsg = messages[messages.length - 1];
  if (lastUserMsg.role === "user") {
    await logMessage(sessionId, "user", lastUserMsg.content, context ?? "general");
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    const flagged = isOffTopicRefusal(content);
    await logMessage(sessionId, "assistant", content, context ?? "general", flagged);

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error("Anthropic error:", err);
    return NextResponse.json({ error: "AI service error. Please try again." }, { status: 500 });
  }
}
