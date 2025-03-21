import { Metadata } from "next";
import LoginForm from "./LoginForm";
import Link from "next/link";
import GoogleSignInButton from "./google/GoogleSignInButton";

/**
 * Metadata pro SEO
 */
export const metadata: Metadata = {
  title: "Login",
};

/**
 * Stranka pro prihlaseni
 * Obsahuje moznost prihlaseni pres Google nebo prihlasovaci formular
 */
export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="rounded-2x1 flex h-full max-h-[40rem] w-full max-w-[32rem] overflow-hidden bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10">
          <h1 className="text-3x1 text-center">Login</h1>
          <div className="space-y-5">
            {/* Prihlaseni pres Google */}
            <GoogleSignInButton />

            {/* Oddelovac */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted" />
              <span>OR</span>
              <div className="h-px flex-1 bg-muted" />
            </div>

            {/* Standardni prihlasovaci formular */}
            <LoginForm />

            {/* Odkaz na registraci */}
            <Link href="/signup" className="block text-center hover:underline">
              Don&apos;t have an account? Sign up.
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
