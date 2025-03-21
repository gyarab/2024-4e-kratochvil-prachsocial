import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

/**
 * API Route pro praci s followers
 * Obsahuje metody pro zjisteni poctu followers, pridani a odebrani follow
 */

/**
 * GET - Zjisti informace o followering
 * Vraci pocet followers a jestli prihlaseny uzivatel sleduje daneho uzivatele
 */
export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    // Kontrola prihlaseni uzivatele
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Nacteni dat o sledovani uzivatele
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: { followerId: loggedInUser.id }, // Je mezi followery prihlaseny uzivatel?
          select: { followerId: true },
        },
        _count: {
          select: {
            followers: true, // Celkovy pocet followers
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Priprava dat pro odpoved
    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length, // Pokud je pole neprazdne, uzivatel sleduje
    };

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST - Sledovat uzivatele
 * Vytvori follow zaznam a notifikaci pro sledovaneho uzivatele
 */
export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    // Kontrola prihlaseni uzivatele
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Transakce - vytvoreni follow zaznamu a notifikace
    await prisma.$transaction([
      // Upsert follow - vytvori novy nebo necha existujici beze zmeny
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId,
          },
        },
        create: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
        update: {},
      }),
      // Vytvoreni notifikace o followingu
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE - Prestat sledovat uzivatele
 * Odstrani follow zaznam a souvisejici notifikaci
 */
export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    // Kontrola prihlaseni uzivatele
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Transakce - smazani follow zaznamu a souvisejici notifikace
    await prisma.$transaction([
      // Smazani follow zaznamu
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      }),
      // Smazani notifikace o followingu
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
