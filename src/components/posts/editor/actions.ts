"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { PostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: string) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const {} = createPostSchema.parse({ content: input });

  const newPost = await prisma.post.create({
    data: {
      content: input,
      userId: user.id,
    },
    include: PostDataInclude,
  });

  return newPost;
}