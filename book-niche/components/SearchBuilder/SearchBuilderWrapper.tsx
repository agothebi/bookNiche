"use client";

import { useState, useCallback } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { SearchBuilder } from "./SearchBuilder";
import { ResultsGallery } from "@/components/ResultsGallery";
import type { AppState, AIResponse, BookRecommendation } from "@/lib/types";

type ActiveState = Extract<AppState, "INPUT" | "ANALYZING" | "CLARIFYING" | "LOADING_FINAL" | "RESULTS" | "EDITING">;

export function SearchBuilderWrapper() {
  const [appState, setAppState] = useState<ActiveState>("INPUT");
  const [tags, setTags] = useState<string[]>([]);
  const [books, setBooks] = useState<BookRecommendation[]>([]);
  const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const callCurate = useCallback(
    async (submittedTags: string[], answer?: string): Promise<AIResponse | null> => {
      try {
        const res = await fetch("/api/curate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tags: submittedTags,
            ...(answer ? { clarificationAnswer: answer } : {}),
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            (data as any)?.error ?? `API error: ${res.status}`,
          );
        }

        return (await res.json()) as AIResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      }
    },
    [],
  );

  async function handleSubmit(submittedTags: string[]) {
    setTags(submittedTags);
    setError(null);
    setAppState("ANALYZING");

    const response = await callCurate(submittedTags);
    if (!response) {
      setAppState("INPUT");
      return;
    }

    if (response.type === "clarification") {
      setClarificationQuestion(response.question);
      setClarificationAnswer("");
      setAppState("CLARIFYING");
    } else {
      setBooks(response.books);
      setAppState("RESULTS");
    }
  }

  async function handleClarificationSubmit(e: React.FormEvent) {
    e.preventDefault();
    const answer = clarificationAnswer.trim();
    if (!answer) return;

    setError(null);
    setAppState("LOADING_FINAL");

    const response = await callCurate(tags, answer);
    if (!response) {
      setAppState("CLARIFYING");
      return;
    }

    if (response.type === "recommendations") {
      setBooks(response.books);
      setAppState("RESULTS");
    } else {
      // Extremely rare: second clarification — treat as new question
      setClarificationQuestion(response.question);
      setClarificationAnswer("");
      setAppState("CLARIFYING");
    }
  }

  function handleAdjustSpell() {
    setError(null);
    setAppState("EDITING");
  }

  // ─── ANALYZING / LOADING_FINAL ─────────────────────────────────────────────
  if (appState === "ANALYZING" || appState === "LOADING_FINAL") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-[var(--sakura)]/15" />
          <Sparkles
            className="w-10 h-10 text-[var(--sakura)] animate-glow-pulse relative z-10"
            strokeWidth={1.5}
          />
        </div>
        <div className="text-center space-y-2">
          <p className="font-serif text-xl text-[var(--foreground)]">
            {appState === "ANALYZING"
              ? "The spirits of the library are consulting the archives…"
              : "Weaving your answer into the search…"}
          </p>
          <p className="text-sm text-[var(--foreground-muted)]">
            This may take a moment.
          </p>
        </div>
        <Loader2 className="w-5 h-5 text-[var(--foreground-muted)] animate-spin" />
      </div>
    );
  }

  // ─── CLARIFYING ────────────────────────────────────────────────────────────
  if (appState === "CLARIFYING" && clarificationQuestion) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500 space-y-8">
        {/* Question */}
        <div className="rounded-3xl border border-[var(--border)] bg-white/80 backdrop-blur-sm shadow-lg p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-[var(--sakura-deep)] mb-1">
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Curator's Question
            </span>
          </div>
          <p className="font-serif text-xl sm:text-2xl text-[var(--foreground)] leading-snug">
            {clarificationQuestion}
          </p>
        </div>

        {/* Answer form */}
        <form onSubmit={handleClarificationSubmit} className="space-y-4">
          <textarea
            value={clarificationAnswer}
            onChange={(e) => setClarificationAnswer(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-5 py-4 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/40 focus:border-[var(--sakura)] transition resize-none text-base"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!clarificationAnswer.trim()}
              className="flex items-center gap-2 rounded-full bg-[var(--sakura-deep)] text-white font-semibold px-6 py-3 text-sm hover:bg-[var(--sakura-deep)]/90 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm"
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              Continue the search
            </button>
            <button
              type="button"
              onClick={() => { setAppState("INPUT"); setError(null); }}
              className="rounded-full border border-[var(--border)] bg-white/80 text-[var(--foreground)] font-medium px-5 py-3 text-sm hover:bg-[var(--sakura)]/10 hover:border-[var(--sakura)]/40 hover:text-[var(--sakura-deep)] transition"
            >
              Start over
            </button>
          </div>
        </form>

        {error && <ErrorBanner message={error} />}
      </div>
    );
  }

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  if (appState === "RESULTS") {
    return (
      <>
        {error && (
          <div className="w-full max-w-5xl mx-auto mb-4">
            <ErrorBanner message={error} />
          </div>
        )}
        <ResultsGallery books={books} tags={tags} onAdjust={handleAdjustSpell} />
      </>
    );
  }

  // ─── INPUT / EDITING ───────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <ErrorBanner message={error} />
        </div>
      )}
      <SearchBuilder
        initialTags={tags}
        onTagsChange={setTags}
        onSubmit={handleSubmit}
        submitLabel="Curate Collection"
      />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
      <span>{message}</span>
    </div>
  );
}
