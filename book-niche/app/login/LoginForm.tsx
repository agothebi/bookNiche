"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2, BookOpen } from "lucide-react";

const REDIRECT_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback`
    : "/auth/callback";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"idle" | "magic" | "google">("idle");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email." });
      return;
    }
    setLoading("magic");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: REDIRECT_URL,
      },
    });
    setLoading("idle");
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({
      type: "success",
      text: "Check your inbox — we've sent you a magic link to sign in.",
    });
  }

  async function handleGoogleSignIn() {
    setMessage(null);
    setLoading("google");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: REDIRECT_URL,
      },
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading("idle");
      return;
    }
    // Redirect is handled by OAuth flow
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--sakura)]/10 text-[var(--sakura-deep)] mb-4">
          <BookOpen className="w-7 h-7" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[var(--foreground)] tracking-tight">
          Welcome to BookNiche
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Enter your email for a magic link, or continue with Google.
        </p>
      </div>

      <form onSubmit={handleMagicLink} className="space-y-4">
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]"
            strokeWidth={1.5}
          />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading !== "idle"}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-white/80 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/40 focus:border-[var(--sakura)] transition disabled:opacity-60"
            autoComplete="email"
          />
        </div>
        <button
          type="submit"
          disabled={loading !== "idle"}
          className="w-full py-3 rounded-xl bg-[var(--sakura)] text-white font-medium hover:bg-[var(--sakura-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] transition disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading === "magic" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending…
            </>
          ) : (
            "Send Magic Link"
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--background)] px-3 text-[var(--foreground-muted)]">
            or
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading !== "idle"}
        className="w-full py-3 rounded-xl border border-[var(--border)] bg-white/80 text-[var(--foreground)] font-medium hover:bg-[var(--mikan-soft)]/50 hover:border-[var(--mikan)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--mikan)]/30 focus:ring-offset-2 focus:ring-offset-[var(--background)] transition disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {loading === "google" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Redirecting…
          </>
        ) : (
          "Continue with Google"
        )}
      </button>

      {message && (
        <p
          className={`text-sm text-center rounded-lg py-2 px-3 ${
            message.type === "success"
              ? "bg-[var(--sakura)]/10 text-[var(--sakura-deep)]"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
