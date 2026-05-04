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

// ─── Task panel components ────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-text-muted mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-brand-black border border-brand-mid rounded px-3 py-2.5 text-white text-sm gold-focus transition-colors placeholder:text-text-dim";
const selectCls = inputCls + " appearance-none cursor-pointer";

function MarketingPanel({ onSubmit }: { onSubmit: (prompt: string) => void }) {
  const [type, setType] = useState("promotional campaign");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("Instagram & Facebook");
  const [extra, setExtra] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const prompt = `Create a detailed ${type} for BeEnhanced with the following brief:

Goal: ${goal}
Target audience: ${audience || "existing and potential clients in the UK, Ghana, and Ireland"}
Primary platform: ${platform}
${extra ? `Additional notes: ${extra}` : ""}

Please provide:
1. Campaign concept and key message
2. Content ideas (at least 3 specific posts/pieces)
3. Suggested timeline and rollout plan
4. Call-to-action recommendations
5. Any promotional offers or incentives to consider`;
    onSubmit(prompt);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <Field label="Campaign type">
        <select value={type} onChange={e => setType(e.target.value)} className={selectCls}>
          <option>promotional campaign</option>
          <option>seasonal campaign</option>
          <option>referral programme</option>
          <option>loyalty scheme</option>
          <option>new service launch</option>
          <option>re-engagement campaign</option>
          <option>brand awareness campaign</option>
        </select>
      </Field>
      <Field label="Campaign goal">
        <input value={goal} onChange={e => setGoal(e.target.value)} required className={inputCls} placeholder="e.g. Boost bookings for lip fillers in June" />
      </Field>
      <Field label="Target audience">
        <input value={audience} onChange={e => setAudience(e.target.value)} className={inputCls} placeholder="e.g. Women aged 25–45 interested in aesthetics" />
      </Field>
      <Field label="Platform">
        <select value={platform} onChange={e => setPlatform(e.target.value)} className={selectCls}>
          <option>Instagram & Facebook</option>
          <option>TikTok</option>
          <option>Email</option>
          <option>All platforms</option>
          <option>WhatsApp</option>
        </select>
      </Field>
      <Field label="Additional notes (optional)">
        <input value={extra} onChange={e => setExtra(e.target.value)} className={inputCls} placeholder="e.g. Budget is £500, avoid discounting" />
      </Field>
      <button type="submit" className="bg-gold hover:bg-gold-dark text-brand-black text-sm font-medium px-6 py-2.5 rounded transition-colors btn-press">
        Generate Campaign →
      </button>
    </form>
  );
}

function SocialPanel({ onSubmit }: { onSubmit: (prompt: string) => void }) {
  const [platform, setPlatform] = useState("Instagram");
  const [contentType, setContentType] = useState("captions");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("aspirational and professional");
  const [quantity, setQuantity] = useState("5");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const prompt = `Create ${quantity} ${platform} ${contentType} for BeEnhanced about: ${topic}

Tone: ${tone}
Platform: ${platform}

Requirements:
- Each piece should feel premium and on-brand for a high-end aesthetics company
- Include relevant emojis where appropriate for the platform
- ${platform === "Instagram" || platform === "Facebook" ? "Include 10–15 targeted hashtags at the end" : ""}
- ${platform === "TikTok" ? "Include a hook for the first line and a trending sound suggestion" : ""}
- ${platform === "LinkedIn" ? "Keep it professional and business-focused, no hashtag overload" : ""}
- ${contentType === "content calendar" ? "Spread across a full month with post dates, content descriptions, and captions" : ""}
- Each caption/post should have a clear call-to-action (book now, DM us, link in bio, etc.)`;
    onSubmit(prompt);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Platform">
          <select value={platform} onChange={e => setPlatform(e.target.value)} className={selectCls}>
            <option>Instagram</option>
            <option>TikTok</option>
            <option>Facebook</option>
            <option>LinkedIn</option>
          </select>
        </Field>
        <Field label="Content type">
          <select value={contentType} onChange={e => setContentType(e.target.value)} className={selectCls}>
            <option>captions</option>
            <option>Reel scripts</option>
            <option>story ideas</option>
            <option>content calendar</option>
            <option>hashtag sets</option>
            <option>bio copy</option>
          </select>
        </Field>
      </div>
      <Field label="Topic / treatment">
        <input value={topic} onChange={e => setTopic(e.target.value)} required className={inputCls} placeholder="e.g. Lip fillers, anti-wrinkle treatment, summer glow offer" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tone">
          <select value={tone} onChange={e => setTone(e.target.value)} className={selectCls}>
            <option>aspirational and professional</option>
            <option>fun and playful</option>
            <option>educational</option>
            <option>luxurious and exclusive</option>
            <option>urgent / limited time</option>
          </select>
        </Field>
        <Field label="Quantity">
          <select value={quantity} onChange={e => setQuantity(e.target.value)} className={selectCls}>
            <option>3</option>
            <option>5</option>
            <option>7</option>
            <option>10</option>
          </select>
        </Field>
      </div>
      <button type="submit" className="bg-gold hover:bg-gold-dark text-brand-black text-sm font-medium px-6 py-2.5 rounded transition-colors btn-press">
        Generate Content →
      </button>
    </form>
  );
}

const ADMIN_TEMPLATES = [
  { label: "Booking Confirmation", description: "Professional confirmation message for a client appointment", prompt: (extra: string) => `Write a professional booking confirmation message for a BeEnhanced client. Include: appointment date/time placeholder [DATE] [TIME], treatment name placeholder [TREATMENT], location/address placeholder [LOCATION], cancellation policy (48 hours notice), and a warm closing. ${extra ? `Additional notes: ${extra}` : ""} Make it feel premium and personal.` },
  { label: "Cancellation Policy", description: "Full cancellation & rescheduling policy document", prompt: (extra: string) => `Write a comprehensive cancellation and rescheduling policy for BeEnhanced aesthetics clinic. Cover: 48-hour cancellation window, late cancellation fee, no-show policy, how to reschedule, deposit policy, and exceptions. Tone should be firm but professional and warm. ${extra ? `Additional notes: ${extra}` : ""}` },
  { label: "Staff Message", description: "Internal communication to the BeEnhanced team", prompt: (extra: string) => `Write a professional internal staff communication for BeEnhanced. Topic: ${extra || "general team update"}. Keep it clear, motivating, and aligned with BeEnhanced's premium brand standards.` },
  { label: "Service Description", description: "Treatment description for website or menu", prompt: (extra: string) => `Write a premium service description for BeEnhanced for the following treatment: ${extra || "[treatment name]"}. Include: what it is, benefits, what to expect during the treatment, aftercare, and a compelling closing. Tone: sophisticated, expert, and warm. Suitable for a website or printed treatment menu.` },
  { label: "After-Care Instructions", description: "Post-treatment care guide for clients", prompt: (extra: string) => `Write detailed aftercare instructions for BeEnhanced clients following: ${extra || "[treatment name]"}. Cover: immediate aftercare (first 24–48 hours), what to avoid, what to expect (swelling, bruising etc.), when to contact the clinic, and long-term maintenance tips. Tone: caring, clear, and professional.` },
  { label: "Client Intake Form", description: "Pre-appointment consultation form template", prompt: (extra: string) => `Create a client intake / consultation form template for BeEnhanced for: ${extra || "general aesthetic treatments"}. Include sections for: personal details, medical history, current medications, allergies, treatment goals, consent declaration, and signature fields. Make it thorough and professional.` },
];

function AdminPanel({ onSubmit }: { onSubmit: (prompt: string) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [extra, setExtra] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (selected === null) return;
    onSubmit(ADMIN_TEMPLATES[selected].prompt(extra));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-3">
        {ADMIN_TEMPLATES.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setSelected(i); setExtra(""); }}
            className={`text-left p-4 rounded border transition-colors ${
              selected === i
                ? "bg-gold/10 border-gold/40 text-white"
                : "bg-brand-black border-brand-mid text-text-muted hover:border-gold/20 hover:text-white"
            }`}
          >
            <p className="text-sm font-medium mb-1">{t.label}</p>
            <p className="text-xs text-text-dim">{t.description}</p>
          </button>
        ))}
      </div>

      {selected !== null && (
        <Field label={`Details for "${ADMIN_TEMPLATES[selected].label}" (optional)`}>
          <input
            value={extra}
            onChange={e => setExtra(e.target.value)}
            className={inputCls}
            placeholder={
              selected === 2 ? "e.g. New weekend hours starting July" :
              selected === 3 ? "e.g. Hydrafacial, anti-wrinkle injections" :
              selected === 4 ? "e.g. Lip fillers, dermal fillers" :
              "Any specific details to include…"
            }
          />
        </Field>
      )}

      <button
        type="submit"
        disabled={selected === null}
        className="bg-gold hover:bg-gold-dark disabled:bg-brand-mid disabled:text-text-dim text-brand-black text-sm font-medium px-6 py-2.5 rounded transition-colors btn-press"
      >
        Generate Document →
      </button>
    </form>
  );
}

function EmailPanel({ onSubmit }: { onSubmit: (prompt: string) => void }) {
  const [emailType, setEmailType] = useState("follow-up after treatment");
  const [clientName, setClientName] = useState("");
  const [treatment, setTreatment] = useState("");
  const [details, setDetails] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const prompt = `Write a professional ${emailType} email for BeEnhanced${clientName ? ` to ${clientName}` : ""}.

${treatment ? `Treatment / service: ${treatment}` : ""}
${details ? `Additional context: ${details}` : ""}

Requirements:
- Subject line included at the top
- Warm, professional, premium tone matching BeEnhanced's brand
- Clear purpose and call-to-action
- Sign off from the BeEnhanced team
- Appropriate length (not too long, not too brief)
- If relevant, include a booking link placeholder [BOOKING LINK]`;
    onSubmit(prompt);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <Field label="Email type">
        <select value={emailType} onChange={e => setEmailType(e.target.value)} className={selectCls}>
          <option>follow-up after treatment</option>
          <option>appointment reminder</option>
          <option>re-engagement / win-back</option>
          <option>new service announcement</option>
          <option>promotional offer</option>
          <option>monthly newsletter</option>
          <option>review request</option>
          <option>referral invitation</option>
          <option>response to enquiry</option>
          <option>apology / service recovery</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Client name (optional)">
          <input value={clientName} onChange={e => setClientName(e.target.value)} className={inputCls} placeholder="e.g. Sophie" />
        </Field>
        <Field label="Treatment (optional)">
          <input value={treatment} onChange={e => setTreatment(e.target.value)} className={inputCls} placeholder="e.g. Lip fillers" />
        </Field>
      </div>
      <Field label="Additional context (optional)">
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          rows={2}
          className={inputCls + " resize-none"}
          placeholder="e.g. Client hasn't booked in 3 months, last had a Hydrafacial"
        />
      </Field>
      <button type="submit" className="bg-gold hover:bg-gold-dark text-brand-black text-sm font-medium px-6 py-2.5 rounded transition-colors btn-press">
        Draft Email →
      </button>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatClient({ gmailConnected }: Props) {
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

  async function firePrompt(prompt: string) {
    const newMessages: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: res.ok ? data.content : (data.error ?? "An error occurred.") }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await firePrompt(text);
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
  const showTaskPanel = messages.length === 0 && context !== "general";

  return (
    <div className="flex h-screen bg-brand-black overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0"} flex-shrink-0 bg-brand-dark border-r border-brand-mid flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-6 border-b border-brand-mid">
          <h1 className="font-heading text-xl font-light tracking-widest text-gold">
            BE<span className="text-gold-light">ENHANCED</span>
          </h1>
          <p className="text-text-dim text-xs tracking-widest mt-0.5">AI ASSISTANT</p>
        </div>

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

          <div className="pt-4">
            <p className="text-text-dim text-xs tracking-widest uppercase px-3 pb-2">Integrations</p>
            {gmailConnected ? (
              <button
                onClick={loadGmail}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors text-left ${
                  sidebarView === "gmail" ? "bg-gold/10 text-gold border border-gold/20" : "text-text-muted hover:text-white hover:bg-brand-mid"
                }`}
              >
                <span className="text-gold/70 w-4 text-center text-xs">✉</span>
                Gmail
                <span className="ml-auto text-xs bg-brand-mid px-1.5 py-0.5 rounded text-text-muted">Connected</span>
              </button>
            ) : (
              <a href="/api/gmail/auth" className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-text-muted hover:text-white hover:bg-brand-mid transition-colors">
                <span className="text-text-dim w-4 text-center text-xs">✉</span>
                Connect Gmail
              </a>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-brand-mid">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-medium">S</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">Sylvester</p>
              <p className="text-text-dim text-xs truncate">BeEnhanced</p>
            </div>
          </div>
          <button onClick={logout} className="w-full text-left px-3 py-2 text-text-dim text-xs hover:text-red-400 transition-colors rounded hover:bg-brand-mid">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-6 py-4 border-b border-brand-mid bg-brand-dark">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-text-muted hover:text-white transition-colors p-1" aria-label="Toggle sidebar">
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
            <button onClick={() => setMessages([])} className="ml-auto text-text-dim text-xs hover:text-white transition-colors">
              ← New task
            </button>
          )}
          {sidebarView === "gmail" && (
            <button onClick={() => setSidebarView("chat")} className="ml-auto text-text-dim text-xs hover:text-white transition-colors">
              ← Back to chat
            </button>
          )}
        </header>

        {sidebarView === "gmail" ? (
          <div className="flex-1 overflow-hidden flex">
            <div className="w-80 border-r border-brand-mid overflow-y-auto">
              {gmailLoading ? (
                <div className="p-6 text-center text-text-muted text-sm">Loading messages…</div>
              ) : gmailMessages.length === 0 ? (
                <div className="p-6 text-center text-text-muted text-sm">No messages found</div>
              ) : (
                gmailMessages.map((msg) => (
                  <button key={msg.id} onClick={() => handleEmailClick(msg)}
                    className={`w-full text-left p-4 border-b border-brand-mid hover:bg-brand-mid transition-colors ${selectedEmail?.id === msg.id ? "bg-brand-mid" : ""}`}>
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
                  <button onClick={() => useEmailAsContext(selectedEmail)} className="bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-sm px-4 py-2 rounded transition-colors">
                    Draft response with AI
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-text-dim text-sm">Select an email to read it</div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-8">
              {/* Task panel — shown on empty state for non-general contexts */}
              {showTaskPanel && (
                <div className="max-w-2xl">
                  <div className="mb-7">
                    <h3 className="font-heading text-2xl font-light text-white mb-1">{currentContext.label}</h3>
                    <p className="text-text-muted text-sm">
                      {context === "marketing" && "Fill in the brief below and generate a full campaign plan."}
                      {context === "social" && "Choose your platform and topic to generate ready-to-post content."}
                      {context === "admin" && "Pick a template to generate a ready-to-use document."}
                      {context === "email" && "Fill in the details below and get a complete, professional email."}
                    </p>
                  </div>
                  {context === "marketing" && <MarketingPanel onSubmit={firePrompt} />}
                  {context === "social" && <SocialPanel onSubmit={firePrompt} />}
                  {context === "admin" && <AdminPanel onSubmit={firePrompt} />}
                  {context === "email" && <EmailPanel onSubmit={firePrompt} />}
                </div>
              )}

              {/* General empty state */}
              {messages.length === 0 && context === "general" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="text-5xl mb-6 text-gold/20">✦</div>
                  <h3 className="font-heading text-2xl font-light text-white mb-2">General Assistant</h3>
                  <p className="text-text-muted text-sm max-w-sm leading-relaxed">
                    Ask me anything related to BeEnhanced — operations, strategy, communications, or anything else.
                  </p>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <div key={i} className={`flex mb-6 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs mr-3 flex-shrink-0 mt-0.5">✦</div>
                  )}
                  <div className={`max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-gold/10 border border-gold/20 text-white ml-auto"
                      : "bg-brand-deep border border-brand-mid text-white/90 ai-prose"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start mb-6">
                  <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs mr-3 flex-shrink-0">✦</div>
                  <div className="bg-brand-deep border border-brand-mid rounded-lg px-4 py-3 flex items-center gap-1.5">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gold/60 inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gold/60 inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gold/60 inline-block" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input — shown after first message or on general */}
            {(messages.length > 0 || context === "general") && (
              <div className="border-t border-brand-mid bg-brand-dark px-6 py-4">
                <form onSubmit={sendMessage} className="flex items-end gap-3">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={messages.length > 0 ? "Follow up or ask for changes…" : `Message ${currentContext.label}…`}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
