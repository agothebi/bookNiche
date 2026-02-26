import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { SearchBuilderWrapper } from "@/components/SearchBuilder/SearchBuilderWrapper";

export default async function HomePage() {
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
      <main className="flex-1 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 -left-24 w-72 h-72 rounded-full bg-[var(--sakura)]/6 blur-3xl" />
          <div className="absolute bottom-0 -right-24 w-80 h-80 rounded-full bg-[var(--mikan)]/8 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-start pt-8 sm:pt-12 px-4 pb-8">
          <SearchBuilderWrapper />
        </div>
      </main>
    </div>
  );
}
