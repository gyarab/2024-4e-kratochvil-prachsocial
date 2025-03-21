import { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import GoogleSignInButton from "../login/google/GoogleSignInButton";

/**
 * Metadata pro SEO
 */
export const metadata: Metadata = {
  title: "Sign Up",
};

/**
 * Stranka pro registraci noveho uzivatele
 * Nabizi moznost registrace pomoci Google nebo standardniho formulare
 */
export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="rounded-2x1 flex h-full max-h-[40rem] w-full max-w-[32rem] overflow-hidden bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10">
          {/* Nadpis a tagline */}
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-muted-foreground">
              The one and only place full of{" "}
              <span className="italic">Prach</span>
            </p>
          </div>

          <div className="space-y-5">
            {/* Google registrace */}
            <GoogleSignInButton />

            {/* Oddelovac */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted" />
              <span>OR</span>
              <div className="h-px flex-1 bg-muted" />
            </div>

            {/* Standardni registracni formular */}
            <SignUpForm />

            {/* Odkaz na prihlaseni */}
            <Link href="/login" className="block text-center hover:underline">
              Already have an account? Login in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
