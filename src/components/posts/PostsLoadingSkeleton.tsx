import { Skeleton } from "../ui/skeleton";

/**
 * Komponenta zobrazujici nacitaci skeleton pro feed prispevku
 * Zobrazuje tri prazdne prispevky jako indikator nacitani
 */
export default function PostsLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
    </div>
  );
}

/**
 * Komponenta zobrazujici nacitaci skeleton pro jeden prispevek
 * Napodobuje strukturu skutecneho prispevku pomoci prazdnych tvarů
 */
function PostLoadingSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="size-12 rounded-full" /> {/* Avatar uzivatele */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24 rounded" /> {/* Jmeno uzivatele */}
          <Skeleton className="h-4 w-20 rounded" /> {/* Cas prispevku */}
        </div>
      </div>
      <Skeleton className="h-16 rounded" /> {/* Text prispevku */}
    </div>
  );
}
