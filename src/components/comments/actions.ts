"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";

/**
 * Server action pro vytvoreni komentare k prispevku
 * Vytvari komentar a pripadne notifikaci
 *
 * @param post - Prispevek ke kteremu komentar patri
 * @param content - Obsah komentare
 * @returns Vytvoreny komentar s daty
 */
export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  // Kontrola prihlaseni uzivatele
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  // Validace obsahu komentare
  const { content: contentValidated } = createCommentSchema.parse({ content });

  // Transakce - vytvoreni komentare a pripadne notifikace
  const [newComment] = await prisma.$transaction([
    // Vytvoreni komentare
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    }),
    // Vytvoreni notifikace pouze pokud komentar neni ke vlastnimu prispevku
    ...(post.user.id !== user.id
      ? [
          prisma.notification.create({
            data: {
              issuerId: user.id,
              recipientId: post.user.id,
              postId: post.id,
              type: "COMMENT",
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}

/**
 * Server action pro smazani komentare
 * Smazat komentar muze pouze jeho autor
 *
 * @param id - ID komentare ke smazani
 * @returns Smazany komentar
 */
export async function deleteComment(id: string) {
  // Kontrola prihlaseni uzivatele
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  // Nacteni komentare a kontrola existence
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) throw new Error("Comment not found");

  // Kontrola, ze komentar maze jeho autor
  if (comment.userId !== user.id) throw new Error("Unauthorized");

  // Smazani komentare
  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id),
  });

  return deletedComment;
}
