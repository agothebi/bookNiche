"use client";

import { useState } from "react";
import { BookMarked, Check, Loader2, Wand2, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { BookRecommendation } from "@/lib/types";

interface ResultsGalleryProps {
  books: BookRecommendation[];
  tags: string[];
  onAdjust: () => void;
}

export function ResultsGallery({ books, tags, onAdjust }: ResultsGalleryProps) {
  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500 space-y-8 pb-12">
      {/* Top section: searched tags + adjust button */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-white/80 border border-[var(--border)] text-[var(--foreground)] text-xs font-medium px-3 py-1.5"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onAdjust}
          className="shrink-0 flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--sakura)]/10 hover:border-[var(--sakura)]/50 hover:text-[var(--sakura-deep)] transition"
        >
          <Wand2 className="w-4 h-4" strokeWidth={1.5} />
          Adjust the Spell
        </button>
      </div>

      {/* Results count */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--foreground)]">
          The archives have spoken.
        </h2>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          {books.length} title{books.length !== 1 ? "s" : ""} curated for your
          collection.
        </p>
      </div>

      {/* Book cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {books.map((book, i) => (
          <BookCard key={`${book.title}-${i}`} book={book} />
        ))}
      </div>
    </div>
  );
}

type SaveState = "idle" | "saving" | "saved" | "duplicate" | "error";

function BookCard({ book }: { book: BookRecommendation }) {
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
    `${book.title} ${book.author}`,
  )}`;

  async function handleSave() {
    if (saveState === "saving" || saveState === "saved" || saveState === "duplicate") return;

    setSaveState("saving");
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaveState("error");
      return;
    }

    const { error } = await supabase.from("saved_books").insert({
      user_id: user.id,
      title: book.title,
      author: book.author,
      description: book.description,
      match_reason: book.matchReason,
      genres: book.genres,
    });

    if (!error) {
      setSaveState("saved");
      return;
    }

    // Postgres unique constraint violation = already saved
    if (error.code === "23505") {
      setSaveState("duplicate");
      return;
    }

    console.error("[wishlist] save error", error);
    setSaveState("error");
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-[var(--border)] bg-white/60 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Genres */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {book.genres.slice(0, 3).map((genre) => (
          <span
            key={genre}
            className="inline-block rounded-full bg-[var(--foreground)]/8 text-[var(--foreground-muted)] text-[11px] font-medium px-2.5 py-0.5"
          >
            {genre}
          </span>
        ))}
      </div>

      {/* Title & Author */}
      <h3 className="font-serif text-xl font-semibold text-[var(--foreground)] leading-snug mb-0.5">
        {book.title}
      </h3>
      <p className="text-xs font-medium text-[var(--foreground-muted)] mb-3">
        {book.author}
      </p>

      {/* Description */}
      <p className="text-sm text-[var(--foreground)] leading-relaxed mb-4 flex-1">
        {book.description}
      </p>

      {/* Curator's note (matchReason) */}
      <blockquote className="font-serif italic text-sm text-[var(--foreground-muted)] border-l-2 border-[var(--sakura)]/40 pl-3 mb-5 leading-relaxed">
        {book.matchReason}
      </blockquote>

      {/* Action row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Save to wishlist */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving" || saveState === "saved" || saveState === "duplicate"}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:pointer-events-none ${
            saveState === "saved"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : saveState === "duplicate"
              ? "border-[var(--border)] bg-white/80 text-[var(--foreground-muted)]"
              : saveState === "error"
              ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
              : "border-[var(--border)] bg-white/80 text-[var(--foreground-muted)] hover:bg-[var(--sakura)]/10 hover:border-[var(--sakura)]/50 hover:text-[var(--sakura-deep)]"
          }`}
        >
          {saveState === "saving" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
              Saving…
            </>
          ) : saveState === "saved" ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              Saved!
            </>
          ) : saveState === "duplicate" ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              In wishlist
            </>
          ) : saveState === "error" ? (
            <>
              <BookMarked className="w-3.5 h-3.5" strokeWidth={1.5} />
              Try again
            </>
          ) : (
            <>
              <BookMarked className="w-3.5 h-3.5" strokeWidth={1.5} />
              Save to Wishlist
            </>
          )}
        </button>

        {/* Amazon buy link */}
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:bg-[var(--mikan-soft)]/60 hover:border-[var(--mikan)]/40 hover:text-[var(--mikan)] transition"
        >
          <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
          Buy on Amazon
        </a>
      </div>
    </article>
  );
}
