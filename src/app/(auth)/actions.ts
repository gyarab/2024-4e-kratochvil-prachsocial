"use server";

import { lucia, validateRequest } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server action pro odhlaseni uzivatele
 *
 * 1. Overi prihlaseneho uzivatele
 * 2. Zrusí platnost aktualni session
 * 3. Vymaze session cookie
 * 4. Presmeruje na prihlasovaci stranku
 *
 * @throws Error pokud neni uzivatel prihlasen
 */
export async function logout() {
  // Overeni platne session
  const { session } = await validateRequest();

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Zruseni platnosti session v databazi
  await lucia.invalidateSession(session.id);

  // Nastaveni prazdneho cookie (odstraneni)
  const sessionCookie = lucia.createBlankSessionCookie();

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  // Presmerovani na login stranku
  return redirect("/login");
}
