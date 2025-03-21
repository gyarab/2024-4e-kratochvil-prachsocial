import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNowStrict } from "date-fns";

/**
 * Pomocna funkce pro spojeni tailwind tridy
 * Resi konflikty trid a spravne mergovani hodnot
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatuje datum relativne k aktualnimu casu
 * - Pro datumy mladsi nez 24h pouziva format "pred X hodinami"
 * - Pro datumy ze stejneho roku pouziva format "Mesic Den"
 * - Pro starsi datumy pouziva format "Mesic Den, Rok"
 */
export function formatRelativeDate(from: Date) {
  const currentDate = new Date();
  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true });
  } else {
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM d");
    } else {
      return formatDate(from, "MMM d, yyy");
    }
  }
}

/**
 * Formatuje cislo na kompaktni format (napr. 1.2K, 5M)
 */
export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Prevede text na slugified format (napr. "Ahoj Svete" -> "ahoj-svete")
 * Odstrani diakritiku a specialni znaky, vse prevede na mala pismena
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
