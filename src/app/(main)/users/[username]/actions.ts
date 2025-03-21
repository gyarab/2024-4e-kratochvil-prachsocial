"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { getUserDataSelect } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";

/**
 * Aktualizuje profil aktualne prihlaseneho uzivatele
 *
 * @param values - Nove hodnoty profilu (displayName, bio)
 * @returns Aktualizovana data uzivatele
 * @throws Error pri neautorizovanem pristupu nebo nevalidnich datech
 */
export async function updateUserProfile(values: UpdateUserProfileValues) {
  // Validace vstupnich dat
  const validatedValues = updateUserProfileSchema.parse(values);

  // Kontrola prihlaseni uzivatele
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  // Pouziti transakce pro aktualizaci v DB i na Stream serveru
  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: validatedValues,
      select: getUserDataSelect(user.id),
    });

    // Aktualizace jmena v chat platforme Stream
    await streamServerClient.partialUpdateUser({
      id: user.id,
      set: {
        name: validatedValues.displayName,
      },
    });
    return updatedUser;
  });

  return updatedUser;
}
