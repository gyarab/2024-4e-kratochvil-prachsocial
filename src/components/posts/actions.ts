"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

/**
 * Server action pro smazani prispevku
 *
 * @param id - ID prispevku, ktery ma byt smazan
 * @returns Smazany prispevek vcetne vsech navazanych dat
 */
export async function deletePost(id: string) {
  // Overeni, zda je uzivatel prihlaseny
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  // Nacteni prispevku pro kontrolu vlastnictvi
  const post = await prisma.post.findUnique({
    where: { id },
  });

  // Overeni, ze prispevek existuje
  if (!post) throw new Error("Post not found");

  // Overeni, ze uzivatel je vlastnikem prispevku
  if (post.userId !== user.id) throw new Error("Unauthorized");

  // Smazani prispevku a vraceni smazanych dat
  const deletedPost = await prisma.post.delete({
    where: { id },
    include: getPostDataInclude(user.id),
  });

  return deletedPost;
}
