import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { getChatLogs, getAdminSettings, getTopicStats, getFlaggedCount } from "@/lib/db";
import DashboardClient from "../DashboardClient";

export default async function DashboardPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn || session.role !== "admin") redirect("/admin/login");

  const [logs, settings, topicStats, flaggedCount] = await Promise.all([
    getChatLogs(200, 0),
    getAdminSettings(),
    getTopicStats(),
    getFlaggedCount(),
  ]);

  return (
    <DashboardClient
      initialLogs={logs}
      initialSettings={settings}
      topicStats={topicStats}
      flaggedCount={flaggedCount ?? 0}
    />
  );
}
