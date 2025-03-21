import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { SavedInfo } from "@/lib/types";

/**
 * API Route pro spravu ulozenych prispevku
 * Umoznuje zjistit, ulozit a odstranit ulozeny prispevek
 */


// GET - Zjisti, zda uzivatel ma prispevek ulozeny
 
export async function GET(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Kontrola prihlaseni uzivatele
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Zjisteni, zda uzivatel ma prispevek ulozeny
    const saved = await prisma.saved.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId,
        },
      },
    });

    // Priprava dat pro odpoved
    const data: SavedInfo = {
      isSavedByUser: !!saved,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST - Ulozi prispevek pro uzivatele
 * Pouziva upsert pro idempotenci - lze volat vicekrat bez duplicity
 */
export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Kontrola prihlaseni uzivatele
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ulozeni prispevku (nebo zadna zmena, pokud uz je ulozen)
    await prisma.saved.upsert({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId,
        },
      },
      create: {
        userId: loggedInUser.id,
        postId,
      },
      update: {},
    });

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE - Odstrani prispevek z ulozenych
 */
export async function DELETE(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Kontrola prihlaseni uzivatele
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Odstraneni prispevku z ulozenych
    await prisma.saved.deleteMany({
      where: {
        userId: loggedInUser.id,
        postId,
      },
    });

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
