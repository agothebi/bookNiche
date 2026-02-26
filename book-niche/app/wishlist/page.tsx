import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { BookMarked } from "lucide-react";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 relative py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--sakura)]/10 text-[var(--sakura-deep)] mb-6">
            <BookMarked className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-[var(--foreground)]">
            Your wishlist
          </h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
            Books you save from recommendations will appear here.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--sakura)]/15 text-[var(--sakura-deep)] px-5 py-2.5 font-medium hover:bg-[var(--sakura)]/25 transition"
          >
            Curate collection
          </Link>
        </div>
      </main>
    </div>
  );
}
