"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ContextKey } from "@/lib/anthropic";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

const CONTEXTS: { key: ContextKey; label: string; icon: string }[] = [
  { key: "general", label: "General Assistant", icon: "✦" },
  { key: "marketing", label: "Marketing", icon: "◈" },
  { key: "social", label: "Social Media", icon: "◎" },
  { key: "admin", label: "Admin & Ops", icon: "◇" },
  { key: "email", label: "Email Drafts", icon: "◻" },
];

interface Props {
  gmailConnected: boolean;
  gmailEmail?: string;
}

export default function ChatClient({ gmailConnected, gmailEmail }: Props) {
  const router = useRouter();
  const [context, setContext] = useState<ContextKey>("general");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarView, setSidebarView] = useState<"chat" | "gmail">("chat");
  const [gmailMessages, setGmailMessages] = useState<GmailMessage[]>([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  function switchContext(key: ContextKey) {
    setContext(key);
    setMessages([]);
    setInput("");
  }

  async function sendMessage(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages([...newMessages, { role: "assistant", content: data.error ?? "An error occurred." }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.content }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function loadGmail() {
    setSidebarView("gmail");
    if (gmailMessages.length > 0) return;
    setGmailLoading(true);
    try {
      const res = await fetch("/api/gmail/messages");
      const data = await res.json();
      if (data.messages) setGmailMessages(data.messages);
    } finally {
      setGmailLoading(false);
    }
  }

  async function handleEmailClick(msg: GmailMessage) {
    const res = await fetch(`/api/gmail/messages?id=${msg.id}`);
    const data = await res.json();
    setSelectedEmail(data.message ?? msg);
  }

  async function useEmailAsContext(msg: GmailMessage) {
    setSidebarView("chat");
    const prompt = `I'd like help with this email:\n\nFrom: ${msg.from}\nSubject: ${msg.subject}\n\nSnippet: ${msg.snippet}\n\nPlease help me draft a professional response.`;
    setInput(prompt);
    textareaRef.current?.focus();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const currentContext = CONTEXTS.find((c) => c.key === context)!;

  return (
    <div className="flex h-screen bg-brand-black overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0"} flex-shrink-0 bg-brand-dark border-r border-brand-mid flex flex-col transition-all duration-300 overflow-hidden`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-brand-mid">
          <h1 className="font-heading text-xl font-light tracking-widest text-gold">
            BE<span className="text-gold-light">ENHANCED</span>
          </h1>
          <p className="text-text-dim text-xs tracking-widest mt-0.5">AI ASSISTANT</p>
        </div>

        {/* Context Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-text-dim text-xs tracking-widest uppercase px-3 pb-2">Workspace</p>
          {CONTEXTS.map((c) => (
            <button
              key={c.key}
              onClick={() => { switchContext(c.key); setSidebarView("chat"); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors text-left ${
                context === c.key && sidebarView === "chat"
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "text-text-muted hover:text-white hover:bg-brand-mid"
              }`}
            >
              <span className="text-gold/70 w-4 text-center text-xs">{c.icon}</span>
              {c.label}
            </button>
          ))}

          {/* Gmail */}
          <div className="pt-4">
            <p className="text-text-dim text-xs tracking-widest uppercase px-3 pb-2">Integrations</p>
            {gmailConnected ? (
              <button
                onClick={loadGmail}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors text-left ${
                  sidebarView === "gmail"
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-text-muted hover:text-white hover:bg-brand-mid"
                }`}
              >
                <span className="text-gold/70 w-4 text-center text-xs">✉</span>
                Gmail
                <span className="ml-auto text-xs bg-brand-mid px-1.5 py-0.5 rounded text-text-muted">
                  Connected
                </span>
              </button>
            ) : (
              <a
                href="/api/gmail/auth"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-text-muted hover:text-white hover:bg-brand-mid transition-colors"
              >
                <span className="text-text-dim w-4 text-center text-xs">✉</span>
                Connect Gmail
              </a>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-brand-mid">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-medium">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">Sylvester</p>
              <p className="text-text-dim text-xs truncate">BeEnhanced</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-text-dim text-xs hover:text-red-400 transition-colors rounded hover:bg-brand-mid"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-brand-mid bg-brand-dark">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text-muted hover:text-white transition-colors p-1"
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="2" y1="4.5" x2="16" y2="4.5" />
              <line x1="2" y1="9" x2="16" y2="9" />
              <line x1="2" y1="13.5" x2="16" y2="13.5" />
            </svg>
          </button>
          <div>
            <h2 className="text-white text-sm font-medium">
              {sidebarView === "gmail" ? "Gmail Inbox" : currentContext.label}
            </h2>
            <p className="text-text-dim text-xs">BeEnhanced AI</p>
          </div>
          {sidebarView === "chat" && messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="ml-auto text-text-dim text-xs hover:text-white transition-colors"
            >
              New conversation
            </button>
          )}
          {sidebarView === "gmail" && (
            <button
              onClick={() => setSidebarView("chat")}
              className="ml-auto text-text-dim text-xs hover:text-white transition-colors"
            >
              ← Back to chat
            </button>
          )}
        </header>

        {sidebarView === "gmail" ? (
          /* Gmail view */
          <div className="flex-1 overflow-hidden flex">
            <div className="w-80 border-r border-brand-mid overflow-y-auto">
              {gmailLoading ? (
                <div className="p-6 text-center text-text-muted text-sm">Loading messages…</div>
              ) : gmailMessages.length === 0 ? (
                <div className="p-6 text-center text-text-muted text-sm">No messages found</div>
              ) : (
                gmailMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleEmailClick(msg)}
                    className={`w-full text-left p-4 border-b border-brand-mid hover:bg-brand-mid transition-colors ${
                      selectedEmail?.id === msg.id ? "bg-brand-mid" : ""
                    }`}
                  >
                    <p className="text-white text-xs font-medium truncate mb-0.5">{msg.subject}</p>
                    <p className="text-text-muted text-xs truncate mb-1">{msg.from}</p>
                    <p className="text-text-dim text-xs line-clamp-2">{msg.snippet}</p>
                  </button>
                ))
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {selectedEmail ? (
                <div>
                  <div className="mb-6">
                    <h3 className="font-heading text-xl text-white mb-2">{selectedEmail.subject}</h3>
                    <p className="text-text-muted text-sm">{selectedEmail.from}</p>
                    <p className="text-text-dim text-xs">{selectedEmail.date}</p>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap mb-6">
                    {(selectedEmail as any).body ?? selectedEmail.snippet}
                  </p>
                  <button
                    onClick={() => useEmailAsContext(selectedEmail)}
                    className="bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-sm px-4 py-2 rounded transition-colors"
                  >
                    Draft response with AI
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-text-dim text-sm">
                  Select an email to read it
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Chat view */
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="text-5xl mb-6 text-gold/20">{currentContext.icon}</div>
                  <h3 className="font-heading text-2xl font-light text-white mb-2">
                    {currentContext.label}
                  </h3>
                  <p className="text-text-muted text-sm max-w-sm leading-relaxed">
                    {context === "general" && "Your dedicated BeEnhanced AI assistant. Ask me anything related to BeEnhanced's operations, marketing, or communications."}
                    {context === "marketing" && "Let's build campaigns, promotions, and growth strategies for BeEnhanced."}
                    {context === "social" && "Create compelling content for BeEnhanced's Instagram, Facebook, TikTok, and LinkedIn."}
                    {context === "admin" && "Streamline bookings, staff comms, policies, and operational workflows."}
                    {context === "email" && "Draft professional client emails, newsletters, and follow-ups."}
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs mr-3 flex-shrink-0 mt-0.5">
                      ✦
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gold/10 border border-gold/20 text-white ml-auto"
                        : "bg-brand-deep border border-brand-mid text-white/90 ai-prose"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs mr-3 flex-shrink-0">
                    ✦
                  </div>
                  <div className="bg-brand-deep border border-brand-mid rounded-lg px-4 py-3 flex items-center gap-1.5">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gold/60 inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gold/60 inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gold/60 inline-block" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-brand-mid bg-brand-dark px-6 py-4">
              <form onSubmit={sendMessage} className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${currentContext.label}…`}
                  rows={1}
                  className="flex-1 bg-brand-deep border border-brand-mid rounded-lg px-4 py-3 text-white text-sm resize-none gold-focus transition-colors placeholder:text-text-dim leading-relaxed"
                  style={{ minHeight: "48px", maxHeight: "200px" }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex-shrink-0 w-11 h-11 bg-gold hover:bg-gold-dark disabled:bg-brand-mid disabled:text-text-dim text-brand-black rounded-lg flex items-center justify-center transition-colors btn-press"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1.5 8L7.5 2M7.5 2L13.5 8M7.5 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </button>
              </form>
              <p className="text-text-dim text-xs mt-2 text-center">
                BeEnhanced AI · Restricted to business use only · Press Enter to send
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
