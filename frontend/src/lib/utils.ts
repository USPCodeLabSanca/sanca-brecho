import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState, useEffect } from "react";

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler); // cleanup on change/unmount
    };
  }, [value, delay]);

  return debouncedValue;
}
