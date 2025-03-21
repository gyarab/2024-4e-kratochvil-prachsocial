// https://lucia-auth.com/getting-started/nextjs-app

import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./lib/prisma";
import { Lucia, Session, User } from "lucia";
import { cache } from "react";
import { cookies } from "next/headers";
import { Google } from "arctic";

/**
 * Vytvoreni adapteru pro lucia-auth, ktery pouziva Prisma ORM
 */
const adapter = new PrismaAdapter(prisma.session, prisma.user);

/**
 * Hlavni instance autentizacniho systemu Lucia
 */
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false, // Session cookie (expirace pri zavreni prohlizece)
    attributes: {
      secure: process.env.NODE_ENV === "production", // HTTPS pouze v produkci
    },
  },
  // Definuje, ktere atributy z DB budou dostupne v user objektu
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      username: databaseUserAttributes.username,
      displayName: databaseUserAttributes.displayName,
      avatarUrl: databaseUserAttributes.avatarUrl,
      googleId: databaseUserAttributes.googleId,
    };
  },
});

/**
 * Rozsireni typu v Lucia knihovne
 * Nezbytne pro spravnou typovou kontrolu
 */
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: databaseUserAttributes;
  }
}

/**
 * Rozhrani pro atributy uzivatele v databazi
 */
interface databaseUserAttributes {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  googleId: string | null;
}

/**
 * Instance Google OAuth providera pro prihlasovani pres Google
 */
export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
);

/**
 * Pomocna funkce pro overeni session uzivatele
 * Cachuje vysledek pro lepsi vykon v ramci jednoho requestu
 *
 * @returns Objekt s userem a session pokud je uzivatel prihlasen, jinak null hodnoty
 */
export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    // Ziskame session ID z cookies
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return { user: null, session: null };
    }

    // Overime, zda je session platna
    const result = await lucia.validateSession(sessionId);

    try {
      // Pokud je session "fresh" (prave vytvorena nebo prodlouzena), aktualizujeme cookie
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }

      // Pokud neni zadna session, vytvorime prazdnou cookie pro smazani existujici
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch {}

    return result;
  },
);
