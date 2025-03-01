import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();

const formatFileUrl = (fileUrl: string) => {

  const filePathMatch = fileUrl.match(/\/f\/(.+)$/);
  if (!filePathMatch || !filePathMatch[1]) {
    console.error("Could not parse file URL:", fileUrl);
    return fileUrl;
  }
  
  const filePath = filePathMatch[1];
  return `https://utfs.io/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/${filePath}`;
};

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "1MB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.avatarUrl;
      if (oldAvatarUrl) {
        const keyMatch = oldAvatarUrl.match(/\/a\/[^/]+\/(.+)$/);
        if (keyMatch && keyMatch[1]) {
          await new UTApi().deleteFiles(keyMatch[1]);
        }
      }
      
      const newAvatarUrl = formatFileUrl(file.url);
      
      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: { avatarUrl: newAvatarUrl },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: {
            image: newAvatarUrl,
          },
        }),
      ]);
      return { avatarUrl: newAvatarUrl };
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "16MB", maxFileCount: 5 },
  })
  .middleware(async () => {
    const { user } = await validateRequest();
    if (!user) throw new UploadThingError("Unauthorized");
    return {};
  })
  .onUploadComplete(async ({ file }) => {
    const media = await prisma.media.create({
      data: {
        url: formatFileUrl(file.url),
        type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
      },
    });
    return { mediaId: media.id };
  }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
