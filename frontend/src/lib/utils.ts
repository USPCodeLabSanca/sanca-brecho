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

export function isEmoji(char: string): boolean {
  if (!char) return false;
  const codePoint = char.codePointAt(0)!;
  // Rough check for emoji ranges in Unicode
  return (
    (codePoint >= 0x1F600 && codePoint <= 0x1F64F) || // Emoticons
    (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) || // Symbols & Pictographs
    (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) || // Transport & Map
    (codePoint >= 0x2600 && codePoint <= 0x26FF) || // Misc symbols
    (codePoint >= 0x2700 && codePoint <= 0x27BF) || // Dingbats
    (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) || // Supplemental Symbols
    (codePoint >= 0x1FA70 && codePoint <= 0x1FAFF)    // Extended symbols
  );
}
