import { validateRequest } from "@/auth";
import streamServerClient from "@/lib/stream";
import { MessageCountInfo } from "@/lib/types";

/**
 * API Route pro ziskani poctu neprectenych zprav
 * Ziskava data ze Stream chat platformy
 */
export async function GET() {
  try {
    // Kontrola prihlaseni uzivatele
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ziskani poctu neprectenych zprav ze Stream API
    const { total_unread_count } = await streamServerClient.getUnreadCount(
      user.id,
    );

    // Priprava dat pro odpoved
    const data: MessageCountInfo = {
      unreadCount: total_unread_count,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
