import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

/**
 * API Route pro ziskani ulozenych prispevku uzivatele
 * Poskytuje data pro stranku "Saved Posts"
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

    // Nacteni ulozenych prispevku z databaze
    // Musi se dotazovat pres tabulku saved a join na post
    const saved = await prisma.saved.findMany({
      where: {
        userId: user.id,
      },
      include: {
        post: {
          include: getPostDataInclude(user.id), // Zahrnuje data o autorovi, likes, atd.
        },
      },
      orderBy: {
        createdAt: "desc", // Nejnoveji ulozene prvni
      },
      take: pageSize + 1, // Nacteme o 1 vic pro zjisteni, jestli existuji dalsi
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Zjisteni, zda existuji dalsi prispevky (pro dalsi stranku)
    const nextCursor = saved.length > pageSize ? saved[pageSize].id : null;

    // Priprava dat pro odpoved
    // Transformace z ulozenych zaznamu na samotne prispevky
    const data: PostsPage = {
      posts: saved.slice(0, pageSize).map((bookmark) => bookmark.post),
      nextCursor,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
