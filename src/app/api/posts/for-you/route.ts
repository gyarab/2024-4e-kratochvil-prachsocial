import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

/**
 * API Route pro ziskani vsech prispevku pro feed "For You"
 * Vraci prispevky razene od nejnovejsich, bez filtrovani
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

    // Nacteni vsech prispevku bez filtrovani
    const posts = await prisma.post.findMany({
      include: getPostDataInclude(user.id), // Zahrnuje data o autorovi, likes, atd.
      orderBy: { createdAt: "desc" }, // Nejnovejsi prvni
      take: pageSize + 1, // Nacteme o 1 vic pro zjisteni, jestli existuji dalsi
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Zjisteni, zda existuji dalsi prispevky (pro dalsi stranku)
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    // Priprava dat pro odpoved (bez prebytecneho prispevku pro zjisteni next cursor)
    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
