"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.ok) {
      router.push("/admin/dashboard");
    } else {
      setError(data.error ?? "Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-light tracking-widest text-gold mb-1">
            BE<span className="text-gold-light">ENHANCED</span>
          </h1>
          <p className="text-text-muted text-xs tracking-[0.3em] uppercase">Admin Panel</p>
        </div>

        <div className="bg-brand-dark border border-brand-mid rounded-lg p-8">
          <h2 className="font-heading text-2xl font-light text-center text-white mb-1">Admin Access</h2>
          <p className="text-text-muted text-sm text-center mb-8">Owner credentials required</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs tracking-widest uppercase text-text-muted mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-deep border border-brand-mid rounded px-4 py-3 text-white text-sm gold-focus transition-colors placeholder:text-text-dim"
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-dark text-brand-black font-medium text-sm tracking-widest uppercase py-3 rounded transition-colors btn-press disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating…" : "Enter Dashboard"}
            </button>
          </form>
        </div>

        <p className="text-text-dim text-xs text-center mt-6">
          <a href="/login" className="hover:text-text-muted transition-colors">← Back to user login</a>
        </p>
      </div>
    </div>
  );
}
