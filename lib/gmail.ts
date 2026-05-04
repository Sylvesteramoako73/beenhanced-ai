import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
];

export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/gmail/callback`
  );
}

export function getAuthUrl(): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export function createAuthedClient(accessToken: string, refreshToken?: string) {
  const client = createOAuthClient();
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.gmail({ version: "v1", auth: client });
}

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body?: string;
}

function decodeBase64(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

function extractBody(payload: any): string {
  if (!payload) return "";
  if (payload.body?.data) return decodeBase64(payload.body.data);
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }
  }
  return "";
}

function getHeader(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export async function listMessages(
  accessToken: string,
  refreshToken?: string,
  maxResults: number = 20
): Promise<GmailMessage[]> {
  const gmail = createAuthedClient(accessToken, refreshToken);
  const listRes = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    labelIds: ["INBOX"],
  });

  const messages = listRes.data.messages ?? [];
  const results: GmailMessage[] = [];

  for (const msg of messages.slice(0, maxResults)) {
    const detail = await gmail.users.messages.get({ userId: "me", id: msg.id! });
    const headers = detail.data.payload?.headers ?? [];
    results.push({
      id: msg.id!,
      threadId: msg.threadId!,
      subject: getHeader(headers, "subject") || "(no subject)",
      from: getHeader(headers, "from"),
      date: getHeader(headers, "date"),
      snippet: detail.data.snippet ?? "",
    });
  }

  return results;
}

export async function getMessage(
  id: string,
  accessToken: string,
  refreshToken?: string
): Promise<GmailMessage | null> {
  const gmail = createAuthedClient(accessToken, refreshToken);
  const detail = await gmail.users.messages.get({ userId: "me", id });
  const headers = detail.data.payload?.headers ?? [];
  return {
    id,
    threadId: detail.data.threadId!,
    subject: getHeader(headers, "subject") || "(no subject)",
    from: getHeader(headers, "from"),
    date: getHeader(headers, "date"),
    snippet: detail.data.snippet ?? "",
    body: extractBody(detail.data.payload),
  };
}

export async function createDraft(
  to: string,
  subject: string,
  body: string,
  accessToken: string,
  refreshToken?: string
): Promise<string> {
  const gmail = createAuthedClient(accessToken, refreshToken);
  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw } },
  });
  return res.data.id!;
}
