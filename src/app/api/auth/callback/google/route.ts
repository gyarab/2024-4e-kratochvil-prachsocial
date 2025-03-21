import { google, lucia } from "@/auth";
import ky from "@/lib/ky";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { slugify } from "@/lib/utils";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

/**
 * API Route pro callback z Google OAuth prihlaseni
 * Zpracovava prihlaseni pomoci Google uctu
 */
export async function GET(req: NextRequest) {
  // Ziskani parametru z URL a cookies
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const storedState = cookies().get("state")?.value;
  const storedCodeVerifier = cookies().get("code_verifier")?.value;

  // Kontrola platnosti parametru - ochrana proti CSRF
  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, { status: 400 });
  }

  try {
    // Vymena authorization code za access token
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    // Ziskani informaci o uzivateli z Google API
    const googleUser = await ky
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      .json<{ id: string; name: string }>();

    // Kontrola, zda uzivatel uz existuje v databazi
    const existingUser = await prisma.user.findUnique({
      where: {
        googleId: googleUser.id,
      },
    });

    if (existingUser) {
      // Uzivatel existuje - vytvorime session a prihlasime ho
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      // Presmerovani na hlavni stranku
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    // Uzivatel neexistuje - vytvorime noveho
    const userId = generateIdFromEntropySize(10);

    const username = slugify(googleUser.name) + "-" + userId.slice(0, 4);

    // Pouziti transakce pro vytvoreni uzivatele v databazi i v Stream
    await prisma.$transaction(async (tx) => {
      // Vytvoreni uzivatele v databazi
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: googleUser.name,
          googleId: googleUser.id,
        },
      });

      // Vytvoreni uzivatele v Stream pro chat
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });
    });

    // Vytvoreni session a prihlaseni uzivatele
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Presmerovani na hlavni stranku
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }
    return new Response(null, { status: 500 });
  }
}
