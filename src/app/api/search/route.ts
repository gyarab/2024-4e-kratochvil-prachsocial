import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

/**
 * API Route pro vyhledavani prispevku
 * Vyhledava podle obsahu prispevku nebo podle jmena/username autora
 */
export async function GET(req: NextRequest) {
  try {
    // Ziskani vyhledavaciho dotazu a parametru strankovani z URL
    const q = req.nextUrl.searchParams.get("q") || "";
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Uprava dotazu pro full-text search v PSQL
    // Spojeni slov pomoci operatoru & (AND)
    const searchQuery = q.split(" ").join(" & ");

    const pageSize = 10;

    // Kontrola prihlaseni uzivatele
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vyhledavani prispevku podle ruznych kriterii
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          // Vyhledavani v obsahu prispevku
          {
            content: {
              search: searchQuery,
            },
          },
          // Vyhledavani podle jmena autora
          {
            user: {
              displayName: {
                search: searchQuery,
              },
            },
          },
          // Vyhledavani podle username autora
          {
            user: {
              username: {
                search: searchQuery,
              },
            },
          },
        ],
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" }, // Nejnovejsi prvni
      take: pageSize + 1, // Nacteme o 1 vic pro zjisteni, jestli existuji dalsi
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Zjisteni, zda existuji dalsi prispevky (pro dalsi stranku)
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    // Priprava dat pro odpoved
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
