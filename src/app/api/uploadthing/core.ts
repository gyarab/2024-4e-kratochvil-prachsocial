//https://docs.uploadthing.com/getting-started/appdir#set-up-a-file-router

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

// Inicializace uploadthing
const f = createUploadthing();

/**
 * Pomocna funkce pro prevod URL z uploadthing na verejnou URL
 * Prevadi internal /f/ cestu na verejnou /a/ cestu s App ID
 */
const formatFileUrl = (fileUrl: string) => {

  const filePathMatch = fileUrl.match(/\/f\/(.+)$/);
  if (!filePathMatch || !filePathMatch[1]) {
    console.error("Could not parse file URL:", fileUrl);
    return fileUrl;
  }
  
  const filePath = filePathMatch[1];
  return `https://utfs.io/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/${filePath}`;
};

/**
 * Definice rout pro uploadthing
 * Obsahuje dva endpointy: avatar pro nahrani profilovych obrazku
 * a attachment pro nahrani priloh k prispevkum
 */
export const fileRouter = {
  // Endpoint pro nahrani profilove fotky
  avatar: f({
    image: { maxFileSize: "1MB" },
  })
    .middleware(async () => {
      // Kontrola prihlaseni uzivatele
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Odstraneni stareho avataru, pokud existuje
      const oldAvatarUrl = metadata.user.avatarUrl;
      if (oldAvatarUrl) {
        const keyMatch = oldAvatarUrl.match(/\/a\/[^/]+\/(.+)$/);
        if (keyMatch && keyMatch[1]) {
          await new UTApi().deleteFiles(keyMatch[1]);
        }
      }

      // Prevod URL do verejne dostupneho formatu
      const newAvatarUrl = formatFileUrl(file.url);

      // Aktualizace avataru v databazi a na Stream serveru
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

  // Endpoint pro nahrani priloh k prispevkum (obrazky a videa)
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "16MB", maxFileCount: 5 },
  })
  .middleware(async () => {
    // Kontrola prihlaseni uzivatele
    const { user } = await validateRequest();
    if (!user) throw new UploadThingError("Unauthorized");
    return {};
  })
  .onUploadComplete(async ({ file }) => {
    // Ulozeni zaznamu o souboru do databaze
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
