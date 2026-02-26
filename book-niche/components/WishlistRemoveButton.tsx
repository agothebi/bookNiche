"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function WishlistRemoveButton({ bookId }: { bookId: string }) {
  const [state, setState] = useState<"idle" | "removing">("idle");
  const router = useRouter();

  async function handleRemove() {
    setState("removing");
    const supabase = createClient();
    const { error } = await supabase
      .from("saved_books")
      .delete()
      .eq("id", bookId);

    if (error) {
      console.error("[wishlist] remove error", error);
      setState("idle");
      return;
    }

    // Refresh the Server Component so the list re-fetches without a full reload
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={state === "removing"}
      aria-label="Remove from wishlist"
      className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border)] bg-white/80 text-[var(--foreground-muted)] hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50 disabled:pointer-events-none transition"
    >
      {state === "removing" ? (
        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
      ) : (
        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
      )}
    </button>
  );
}
