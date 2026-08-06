import { useEffect, useRef, useState } from "react";

export function useClipboard(resetAfter = 1800) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  async function copy(text: string) {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), resetAfter);
      return true;
    } catch {
      setCopied(false);
      setCopyError(true);
      return false;
    }
  }

  return { copied, copyError, copy };
}
