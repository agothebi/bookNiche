import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Ambient background orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[var(--sakura)]/8 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-[var(--mikan)]/10 blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-[var(--sakura)]/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <LoginForm />
        <p className="mt-8 text-xs text-[var(--foreground-muted)] max-w-xs text-center">
          By continuing, you agree to enter our library. We'll only use your
          email to sign you in and curate your experience.
        </p>
      </div>
    </main>
  );
}
