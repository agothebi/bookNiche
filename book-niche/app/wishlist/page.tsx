import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { BookMarked, ShoppingBag, Sparkles } from "lucide-react";
import { WishlistRemoveButton } from "@/components/WishlistRemoveButton";
import type { SavedBook } from "@/lib/types";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("saved_books")
    .select("id, user_id, title, author, description, match_reason, genres, saved_at")
    .order("saved_at", { ascending: false });

  // Map snake_case DB columns → camelCase SavedBook shape
  const books: SavedBook[] = (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    author: row.author,
    description: row.description,
    matchReason: row.match_reason,
    genres: row.genres ?? [],
    saved_at: row.saved_at,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 relative overflow-hidden py-10 px-4">
        {/* Ambient background blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 -left-24 w-72 h-72 rounded-full bg-[var(--sakura)]/6 blur-3xl" />
          <div className="absolute bottom-0 -right-24 w-80 h-80 rounded-full bg-[var(--mikan)]/8 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--foreground)]">
                Your wishlist
              </h1>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                {books.length === 0
                  ? "Nothing saved yet."
                  : `${books.length} book${books.length !== 1 ? "s" : ""} in your collection.`}
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full bg-[var(--sakura)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--sakura-deep)] transition shadow-sm"
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              Curate more
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Could not load your wishlist. Please try refreshing the page.
            </div>
          )}

          {/* Empty state */}
          {books.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--sakura)]/10 text-[var(--sakura-deep)] mb-5">
                <BookMarked className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <p className="font-serif text-xl text-[var(--foreground)] mb-2">
                The shelves are quiet.
              </p>
              <p className="text-sm text-[var(--foreground-muted)] max-w-xs">
                Save books from your recommendations and they will appear here.
              </p>
            </div>
          )}

          {/* Book list */}
          {books.length > 0 && (
            <ul className="flex flex-col gap-4">
              {books.map((book) => (
                <WishlistRow key={book.id} book={book} />
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function WishlistRow({ book }: { book: SavedBook }) {
  const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
    `${book.title} ${book.author}`,
  )}`;

  return (
    <li className="relative flex flex-col sm:flex-row sm:items-start gap-4 rounded-2xl border border-[var(--border)] bg-white/60 backdrop-blur-sm px-5 py-4 pb-12 sm:pb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Icon column */}
      <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--sakura)]/10 text-[var(--sakura-deep)]">
        <BookMarked className="w-5 h-5" strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="font-serif text-lg font-semibold text-[var(--foreground)] leading-snug">
            {book.title}
          </h2>
          <span className="text-xs text-[var(--foreground-muted)] font-medium">
            {book.author}
          </span>
        </div>

        {/* Genres */}
        {book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {book.genres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="inline-block rounded-full bg-[var(--foreground)]/8 text-[var(--foreground-muted)] text-[11px] font-medium px-2.5 py-0.5"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-[var(--foreground)] leading-relaxed line-clamp-2">
          {book.description}
        </p>

        {/* Curator note */}
        <p className="font-serif italic text-xs text-[var(--foreground-muted)] leading-relaxed line-clamp-2">
          {book.matchReason}
        </p>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex sm:flex-col gap-2 items-center sm:items-end">
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:bg-[var(--mikan-soft)]/60 hover:border-[var(--mikan)]/40 hover:text-[var(--mikan)] transition whitespace-nowrap"
        >
          <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
          Buy on Amazon
        </a>
        <span className="text-[11px] text-[var(--foreground-muted)]">
          {new Date(book.saved_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Remove button — pinned to bottom-right of the card */}
      <div className="absolute bottom-3 right-3">
        <WishlistRemoveButton bookId={book.id} />
      </div>
    </li>
  );
}
