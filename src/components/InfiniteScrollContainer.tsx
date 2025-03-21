import { useInView } from "react-intersection-observer";

interface InfiniteScrollContainerProps extends React.PropsWithChildren {
  onBottomReached: () => void; // Callback volany pri dosazeni spodni casti containeru
  className?: string; // Volitelne CSS tridy
}

export default function InfiniteScrollContainer({
  children,
  onBottomReached,
  className,
}: InfiniteScrollContainerProps) {
  // Pouzivame Intersection Observer API pro detekci, kdy uzivatel doscrolloval k referenci
  const { ref } = useInView({
    rootMargin: "200px", // Spusti se 200px pred dosazenim konce (preloaduje obsah)
    onChange: (inView) => {
      if (inView) {
        onBottomReached(); // Volame callback pro nacteni dalsich dat
      }
    },
  });

  return (
    <div className={className}>
      {children}
      {/* Neviditelny element umisteny na konci, ktery slouzi jako "sentinel" pro detekci scrollu */}
      <div ref={ref} />
    </div>
  );
}
