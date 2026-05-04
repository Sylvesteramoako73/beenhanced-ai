import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const _supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
export const supabase = _supabase!;

export interface ChatLog {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  context: string;
  is_flagged: boolean;
  created_at: string;
}

export interface AdminSettings {
  id: string;
  additional_restrictions: string;
  access_revoked: boolean;
  updated_at: string;
}

export async function logMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  context: string,
  isFlagged: boolean = false
): Promise<void> {
  if (!supabaseUrl || !supabaseKey) return; // graceful no-op if DB not configured
  await supabase.from("chat_logs").insert({
    session_id: sessionId,
    role,
    content,
    context,
    is_flagged: isFlagged,
  });
}

export async function getAdminSettings(): Promise<AdminSettings | null> {
  if (!supabaseUrl || !supabaseKey) {
    return { id: "main", additional_restrictions: "", access_revoked: false, updated_at: new Date().toISOString() };
  }
  const { data } = await supabase
    .from("admin_settings")
    .select("*")
    .eq("id", "main")
    .single();
  return data;
}

export async function isAccessRevoked(): Promise<boolean> {
  const settings = await getAdminSettings();
  return settings?.access_revoked ?? false;
}

export async function getRateLimitCount(minutes: number = 1): Promise<number> {
  if (!supabaseUrl || !supabaseKey) return 0;
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("chat_logs")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", since);
  return count ?? 0;
}

export async function getChatLogs(
  limit: number = 200,
  offset: number = 0
): Promise<ChatLog[]> {
  const { data } = await supabase
    .from("chat_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return data ?? [];
}

export async function getTopicStats(): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("chat_logs")
    .select("context")
    .eq("role", "user");
  if (!data) return {};
  const stats: Record<string, number> = {};
  for (const row of data) {
    stats[row.context] = (stats[row.context] ?? 0) + 1;
  }
  return stats;
}

export async function getFlaggedCount(): Promise<number> {
  const { count } = await supabase
    .from("chat_logs")
    .select("*", { count: "exact", head: true })
    .eq("is_flagged", true);
  return count ?? 0;
}
