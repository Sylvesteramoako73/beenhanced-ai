"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatLog, AdminSettings } from "@/lib/db";

interface Props {
  initialLogs: ChatLog[];
  initialSettings: AdminSettings | null;
  topicStats: Record<string, number>;
  flaggedCount: number;
}

export default function DashboardClient({ initialLogs, initialSettings, topicStats, flaggedCount }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"logs" | "settings" | "stats">("logs");
  const [logs] = useState<ChatLog[]>(initialLogs);
  const [restrictions, setRestrictions] = useState(initialSettings?.additional_restrictions ?? "");
  const [accessRevoked, setAccessRevoked] = useState(initialSettings?.access_revoked ?? false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [filterFlagged, setFilterFlagged] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function saveSettings() {
    setSaving(true);
    setSaveMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ additional_restrictions: restrictions }),
    });
    setSaving(false);
    setSaveMsg(res.ok ? "Settings saved." : "Failed to save.");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function toggleAccess() {
    const res = await fetch("/api/admin/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revoke: !accessRevoked }),
    });
    if (res.ok) setAccessRevoked(!accessRevoked);
  }

  const filteredLogs = logs.filter((log) => {
    if (filterFlagged && !log.is_flagged) return false;
    if (searchQuery && !log.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalMessages = logs.length;
  const userMessages = logs.filter((l) => l.role === "user").length;

  const CONTEXT_LABELS: Record<string, string> = {
    general: "General",
    marketing: "Marketing",
    social: "Social Media",
    admin: "Admin & Ops",
    email: "Email Drafts",
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      {/* Header */}
      <header className="bg-brand-dark border-b border-brand-mid px-8 py-4 flex items-center gap-6">
        <div>
          <h1 className="font-heading text-xl font-light tracking-widest text-gold">
            BE<span className="text-gold-light">ENHANCED</span>
          </h1>
          <p className="text-text-dim text-xs tracking-widest">ADMIN DASHBOARD</p>
        </div>
        <nav className="flex items-center gap-1 ml-8">
          {(["logs", "settings", "stats"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded text-sm capitalize transition-colors ${
                activeTab === tab
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "text-text-muted hover:text-white hover:bg-brand-mid"
              }`}
            >
              {tab === "logs" ? "Chat Logs" : tab === "settings" ? "Restrictions" : "Analytics"}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${accessRevoked ? "bg-red-500" : "bg-green-500"}`} />
            <span className="text-xs text-text-muted">
              Sylvester: {accessRevoked ? "Suspended" : "Active"}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-text-dim text-xs hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-8 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Messages", value: totalMessages },
            { label: "User Messages", value: userMessages },
            { label: "Flagged Off-topic", value: flaggedCount },
            { label: "Topics Used", value: Object.keys(topicStats).length },
          ].map((stat) => (
            <div key={stat.label} className="bg-brand-dark border border-brand-mid rounded-lg p-5">
              <p className="text-text-muted text-xs uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="font-heading text-3xl font-light text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {activeTab === "logs" && (
          <div>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="Search messages…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-brand-deep border border-brand-mid rounded px-4 py-2 text-white text-sm gold-focus w-72 placeholder:text-text-dim"
              />
              <label className="flex items-center gap-2 text-text-muted text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterFlagged}
                  onChange={(e) => setFilterFlagged(e.target.checked)}
                  className="accent-gold"
                />
                Show flagged only
              </label>
              <span className="text-text-dim text-xs ml-auto">
                {filteredLogs.length} messages
              </span>
            </div>

            {/* Logs table */}
            <div className="bg-brand-dark border border-brand-mid rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-brand-mid">
                  <tr>
                    {["Time", "Role", "Context", "Message", ""].map((h) => (
                      <th key={h} className="text-left text-text-dim text-xs tracking-widest uppercase px-4 py-3 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-mid">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-text-dim text-sm">
                        No messages found
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className={`hover:bg-brand-mid/30 transition-colors ${log.is_flagged ? "bg-red-500/5" : ""}`}>
                        <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("en-GB", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            log.role === "user"
                              ? "bg-gold/10 text-gold"
                              : "bg-brand-mid text-text-muted"
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                          {CONTEXT_LABELS[log.context] ?? log.context}
                        </td>
                        <td className="px-4 py-3 text-white/80 max-w-lg">
                          <p className="truncate">{log.content}</p>
                        </td>
                        <td className="px-4 py-3">
                          {log.is_flagged && (
                            <span className="text-red-400 text-xs">⚑ flagged</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            {/* Access control */}
            <div className="bg-brand-dark border border-brand-mid rounded-lg p-6">
              <h3 className="font-heading text-lg text-white mb-1">Access Control</h3>
              <p className="text-text-muted text-sm mb-5">
                Temporarily suspend Sylvester's access to the AI assistant.
              </p>
              <div className="flex items-center justify-between p-4 bg-brand-deep rounded border border-brand-mid">
                <div>
                  <p className="text-white text-sm font-medium">
                    {accessRevoked ? "Access is currently suspended" : "Access is currently active"}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5">
                    {accessRevoked
                      ? "Sylvester cannot use the assistant"
                      : "Sylvester has full assistant access"}
                  </p>
                </div>
                <button
                  onClick={toggleAccess}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    accessRevoked
                      ? "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20"
                      : "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                  }`}
                >
                  {accessRevoked ? "Restore Access" : "Suspend Access"}
                </button>
              </div>
            </div>

            {/* Additional restrictions */}
            <div className="bg-brand-dark border border-brand-mid rounded-lg p-6">
              <h3 className="font-heading text-lg text-white mb-1">Additional Restrictions</h3>
              <p className="text-text-muted text-sm mb-5">
                Add extra instructions to the AI system prompt. These are applied on top of the base restrictions.
              </p>
              <textarea
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                rows={6}
                placeholder="e.g. Do not discuss competitor pricing. Do not generate content for external clients. Restrict email drafts to existing clients only."
                className="w-full bg-brand-deep border border-brand-mid rounded px-4 py-3 text-white text-sm gold-focus resize-none placeholder:text-text-dim leading-relaxed"
              />
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-gold hover:bg-gold-dark text-brand-black text-sm font-medium px-6 py-2.5 rounded transition-colors btn-press disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Restrictions"}
                </button>
                {saveMsg && (
                  <span className={`text-sm ${saveMsg.includes("Failed") ? "text-red-400" : "text-green-400"}`}>
                    {saveMsg}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-brand-dark border border-brand-mid rounded-lg p-6">
              <h3 className="font-heading text-lg text-white mb-5">Usage by Context</h3>
              <div className="space-y-3">
                {Object.entries(topicStats).length === 0 ? (
                  <p className="text-text-muted text-sm">No usage data yet.</p>
                ) : (
                  Object.entries(topicStats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([topic, count]) => {
                      const total = Object.values(topicStats).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={topic}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-text-muted text-sm">
                              {CONTEXT_LABELS[topic] ?? topic}
                            </span>
                            <span className="text-white text-sm">{count}</span>
                          </div>
                          <div className="h-1.5 bg-brand-mid rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
