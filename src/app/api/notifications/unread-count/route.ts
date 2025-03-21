import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NotificationCountInfo } from "@/lib/types";

/**
 * API Route pro ziskani poctu neprectenych notifikaci
 * Pouziva se pro zobrazeni badge na tlacitku notifikaci
 */
export async function GET() {
  try {
    // Kontrola prihlaseni uzivatele
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ziskani poctu neprectenych notifikaci z databaze
    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    });

    // Priprava dat pro odpoved
    const data: NotificationCountInfo = {
      unreadCount,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
