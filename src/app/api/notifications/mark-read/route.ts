import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * API Route pro oznaceni vsech notifikaci jako prectene
 * Pouziva se pri otevreni stranky s notifikacemi
 */
export async function PATCH() {
  try {
    // Kontrola prihlaseni uzivatele
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Aktualizace vsech neprectenych notifikaci na prectene
    await prisma.notification.updateMany({
      where: {
        recipientId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    // Uspesna odpoved bez obsahu
    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
