import prisma from "@/lib/prisma";
import { UTApi } from "uploadthing/server";

/**
 * API Route pro pravidelne cisteni nepouzitych medii
 * Spousteno cronem pro udrzbu uloziste
 *
 * Vymaze medialni soubory, ktere nejsou pripojeny k zadnemu prispevku
 * V produkci musi byt starsi nez 24 hodin (aby nedoslo k vymazani prave nahravanych)
 */
export async function GET(req: Request) {
  try {
    // Autorizacni kontrola pomoci CRON_SECRET
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        { message: "Invalid authorization header" },
        { status: 401 },
      );
    }

    // Najdeme nepouzite medialni soubory
    const unused = await prisma.media.findMany({
      where: {
        postId: null, // Nenalezi zadnemu prispevku
        // V produkci pridame omezeni na stari > 24h, v developmentu bez omezeni
        ...(process.env.NODE_ENV === "production"
          ? {
              createdAt: {
                lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            }
          : {}),
      },
      select: {
        id: true,
        url: true,
      },
    });

    // Smazani souboru z UploadThing
    new UTApi().deleteFiles(
      unused.map(
        (m) =>
          m.url.split(`/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`)[1],
      ),
    );

    // Smazani zaznamu z databaze
    await prisma.media.deleteMany({
      where: {
        id: {
          in: unused.map((m) => m.id),
        },
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
