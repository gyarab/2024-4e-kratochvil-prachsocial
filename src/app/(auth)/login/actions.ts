"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { verify } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Server action pro prihlaseni uzivatele
 *
 * @param credentials - prihlasovaci udaje uzivatele (username, password)
 * @returns Promise, ktery pri uspechu provede redirect na hlavni stranku
 *          nebo vrati objekt s chybovou zpravou
 */
export async function login(
  credentials: LoginValues,
): Promise<{ error: string }> {
  try {
    // Validace vstupnich dat
    const { username, password } = loginSchema.parse(credentials);

    // Vyhledame uzivatele podle uzivatelskeho jmena (case insensitive)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    // Uzivatel neexistuje nebo nema nastavene heslo (napr. pouziva Google)
    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Invalid username or password",
      };
    }

    // Overeni hesla pomoci Argon2
    //https://lucia-auth.com/guides/email-and-password/basics#register-user
    const passwordMatch = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!passwordMatch) {
      return {
        error: "Invalid username or password",
      };
    }

    // Vytvorime novou session
    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Nastavime session cookie
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Presmerujeme uzivatele na domovskou stranku
    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "An unexpected error occurred, please try again.",
    };
  }
}
