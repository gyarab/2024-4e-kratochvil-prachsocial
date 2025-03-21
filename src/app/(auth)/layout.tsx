import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Layout pro autentizacni stranky (login, signup)
 *
 * Kontroluje zda uzivatel neni prihlaseny
 * Pokud je prihlaseny, presmeruje na hlavni stranku
 */
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Overeni zda neni uzivatel uz prihlaseny
  const { user } = await validateRequest();

  // Pokud je prihlaseny, presmerujeme na hlavni stranku
  if (user) redirect("/");

  // Jinak zobrazime obsah (prihlasovaci/registracni stranku)
  return <>{children}</>;
}
