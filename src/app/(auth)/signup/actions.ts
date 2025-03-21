"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { signupSchema, signupValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server action pro registraci noveho uzivatele
 *
 * @param credentials - registracni udaje (username, email, password)
 * @returns Promise, ktery pri uspechu provede presmerovani na hlavni stranku 
 * nebo vrati objekt s chybovou zpravou
 */
export async function signUp(
  credentials: signupValues,
): Promise<{ error: string }> {
  try {
    // Validace vstupnich dat
    const { username, email, password } = signupSchema.parse(credentials);

    // Vytvoreni hash hesla pomoci Argon2
    //https://lucia-auth.com/guides/email-and-password/basics#register-user
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Generovani ID uzivatele
    const userId = generateIdFromEntropySize(10);

    // Kontrola duplicitniho username
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return {
        error: "Username already exists",
      };
    }

    // Kontrola duplicitniho emailu
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Email already exists",
      };
    }

    // Vytvoreni uzivatele v databazi a v Stream v ramci transakce
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
        },
      });
      // Vytvoreni uzivatele v chat sluzbe Stream
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });
    });

    // Vytvoreni session a nastaveni cookie
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Presmerovani na hlavni stranku
    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error(error);
    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
