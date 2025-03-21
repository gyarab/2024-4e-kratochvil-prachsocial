import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

/**
 * API Route pro ziskani dat uzivatele podle username
 * Pouziva se pro zobrazeni profilu uzivatele v tooltip
 */
export async function GET(
  req: Request,
  { params: { username } }: { params: { username: string } },
) {
  try {
    // Kontrola prihlaseni uzivatele
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vyhledani uzivatele podle username
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", // Ignoruje velikost pismen
        },
      },
      select: getUserDataSelect(loggedInUser.id), // Vybere potrebna data vcetne info o sledovani
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
