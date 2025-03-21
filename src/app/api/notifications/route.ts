import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notificationsInclude, NotificationsPage } from "@/lib/types";
import { NextRequest } from "next/server";

/**
 * API Route pro ziskani seznamu notifikaci uzivatele
 * Podporuje strankovani pomoci cursor pagination
 */
export async function GET(req: NextRequest) {
  try {
    // Ziskani parametru strankovani z URL
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    // Kontrola prihlaseni uzivatele
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Nacteni notifikaci z databaze
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: user.id,
      },
      include: notificationsInclude, // Zahrnuje data o odesilateli a souvisejicim prispevku
      orderBy: { createdAt: "desc" }, // Nejnovejsi prvni
      take: pageSize + 1, // Nacteme o 1 vic pro zjisteni, jestli existuji dalsi
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Zjisteni, zda existuji dalsi notifikace (pro dalsi stranku)
    const nextCursor =
      notifications.length > pageSize ? notifications[pageSize].id : null;

    // Priprava dat pro odpoved (bez prebytecne notifikace pro zjisteni next cursor)
    const data: NotificationsPage = {
      notifications: notifications.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
