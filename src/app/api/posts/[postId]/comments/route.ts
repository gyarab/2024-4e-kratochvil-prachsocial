import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/lib/types";
import { NextRequest } from "next/server";

/**
 * API Route pro ziskani komentaru k prispevku
 * Pouziva opacne strankovani - nejstarsi komentare prvni, nacitani smerem k novejsim
 */
export async function GET(
  req: NextRequest,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Ziskani parametru strankovani z URL
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 5;

    // Kontrola prihlaseni uzivatele
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Nacteni komentaru z databaze
    // Pouziva negativni take a ASC razeni pro zobrazeni komentaru zdola nahoru
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: getCommentDataInclude(user.id),
      orderBy: { createdAt: "asc" }, // Od nejstarsich (zdola)
      take: -pageSize - 1, // Negativni take = od konce
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Zjisteni, zda existuji starsi komentare (previous cursor kvuli opacnemu smerovani)
    const previousCursor = comments.length > pageSize ? comments[0].id : null;

    // Priprava dat pro odpoved (bez prebytecneho komentare pro zjisteni previous cursor)
    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
