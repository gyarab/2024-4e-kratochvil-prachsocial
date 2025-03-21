import { useEffect, useState } from "react";

/**
 * Hook pro debouncing hodnot - pouziva se typicky pro vyhledavani nebo jine akce,
 * kde chceme pockat, az uzivatel doresi zadavani hodnoty
 *
 * @param value - Hodnota, kterou chceme "debouncovat"
 * @param delay - Cas v ms, po kterem se hodnota aktualizuje (defaultne 250ms)
 * @returns Aktualizovana hodnota po uplynuti delay
 */
export default function useDebounce<T>(value: T, delay: number = 250): T {
  // Ulozeni debounced hodnoty ve stavu
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Vytvoreni timeoutu, ktery po uplynuti casu "delay" aktualizuje hodnotu
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup funkce ktera zajisti, ze pri kazde zmene hodnoty se predchozi timeout zrusi
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
