"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, LogOut } from "lucide-react";

export function AppHeader() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="flex h-16 w-full items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-semibold text-[var(--foreground)] hover:text-[var(--sakura-deep)] transition"
        >
          <BookOpen
            className="w-7 h-7 text-[var(--sakura)]"
            strokeWidth={1.5}
          />
          BookNiche
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/wishlist"
            className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--sakura-deep)] transition"
          >
            Wishlist
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--sakura)]/10 hover:text-[var(--sakura-deep)] transition"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
