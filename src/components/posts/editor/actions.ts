"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

/**
 * Server action pro vytvoreni noveho prispevku
 *
 * @param input - Obsah prispevku a pole ID nahledu media
 * @returns Novy prispevek se vsemi navazanymi daty
 */
export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  // Overeni, zda je uzivatel prihlaseny
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  // Validace vstupu pomoci Zod schématu
  const { content, mediaIds } = createPostSchema.parse(input);

  // Vytvoreni noveho prispevku v databazi
  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      // Propojeni s existujicimi nahranymi medii
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    // Pripojeni vsech potrebnych dat pro frontend
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
