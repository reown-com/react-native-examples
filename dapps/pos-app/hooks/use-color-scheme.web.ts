import { useEffect, useState } from "react";
import { useColorScheme as useAppColorScheme } from "@/hooks/use-color-scheme";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useAppColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
