//https://zod.dev/?id=basic-usage

import { z } from "zod";

/**
 * Zakladni Zod schema pro povinny textovy retezec
 * - nesmi byt prazdny
 * - orezou se mezery na zacatku a konci
 */
const requiredString = z.string().trim().min(1, "Required");

/**
 * Schema pro validaci registracniho formulare
 */
export const signupSchema = z.object({
  email: requiredString.email("Invalid email"),
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens",
  ),
  password: requiredString.min(
    8,
    "Password must be at least 8 characters long",
  ),
});

// Typ odvozeny ze schemas pro typovou bezpecnost
export type signupValues = z.infer<typeof signupSchema>;

/**
 * Schema pro validaci prihlaseni
 */
export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;

/**
 * Schema pro validaci vytvoreni noveho prispevku
 */
export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z
    .array(z.string())
    .max(5, "You cannot have more than 5 attachments"),
});

/**
 * Schema pro validaci aktualizace profilu uzivatele
 */
export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(200, "Bio must be less than 200 characters long"),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

/**
 * Schema pro validaci noveho komentare
 */
export const createCommentSchema = z.object({
  content: requiredString,
});
