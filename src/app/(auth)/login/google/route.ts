import { google } from "@/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

/**
 * Route handler pro iniciaci Google OAuth procesu
 *
 * 1. Vygeneruje state a code_verifier pro PKCE flow
 * 2. Ulozi je do cookies pro pozdejsi overeni
 * 3. Presmeruje uzivatele na Google prihlasovaci stranku
 */
export async function GET() {
  // Generujeme nahodne hodnoty pro zabezpeceni OAuth flow
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  // Vytvorime autorizacni URL s pozadavkem na pristup k profilu a emailu
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });

  // Ulozime state a code_verifier do cookies s omezenou platnosti (10 minut)
  cookies().set("state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  cookies().set("code_verifier", codeVerifier, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  // Presmerujeme uzivatele na Google autorizacni endpoint
  return Response.redirect(url);
}
