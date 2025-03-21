import { validateRequest } from "@/auth";
import streamServerClient from "@/lib/stream";

/**
 * API Route pro generovani tokenu pro Stream Chat
 * Vraci token pro pripojeni ke Stream API z klienta
 */
export async function GET() {
  try {
    // Kontrola prihlaseni uzivatele
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Nastaveni platnosti tokenu (1 hodina)
    const expiration = Math.floor(Date.now() / 1000) + 60 * 60;
    const issuedAt = Math.floor(Date.now() / 1000) - 60; // Zpetna kompatibilita

    // Vytvoreni Stream tokenu pro prihlaseni klienta
    const token = streamServerClient.createToken(user.id, expiration, issuedAt);

    return Response.json({ token });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
