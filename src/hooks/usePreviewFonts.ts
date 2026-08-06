import { useEffect, useRef, useState } from "react";
import type { PreviewRenderer } from "../data/catalog";
import { loadRendererFonts, rendererFontKey } from "../lib/font-loader";

export type PreviewFontStatus = "idle" | "loading" | "slow" | "loaded" | "failed";

export function usePreviewFonts(renderer: PreviewRenderer, mode: "eager" | "visible") {
  const elementRef = useRef<HTMLDivElement>(null);
  const [requested, setRequested] = useState(mode === "eager");
  const [retry, setRetry] = useState(0);
  const hasRemoteFonts = renderer.fonts.some(
    ({ source, faces }) => source === "fontsource" && faces.length,
  );
  const [status, setStatus] = useState<PreviewFontStatus>(hasRemoteFonts ? "idle" : "loaded");
  const fontKey = rendererFontKey(renderer.fonts);

  useEffect(() => {
    setRequested(mode === "eager");
    setStatus(hasRemoteFonts ? "idle" : "loaded");
  }, [fontKey, hasRemoteFonts, mode]);

  useEffect(() => {
    if (mode !== "visible" || requested || !hasRemoteFonts) return;
    const element = elementRef.current;
    if (!element) return;
    const saveData = Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    );
    if (saveData) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRequested(true);
        observer.disconnect();
      },
      { rootMargin: "300px 0px", threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasRemoteFonts, mode, requested]);

  useEffect(() => {
    if (!requested || !hasRemoteFonts) return;
    let current = true;
    setStatus("loading");
    const slowTimer = window.setTimeout(() => current && setStatus("slow"), 3_000);
    loadRendererFonts(renderer.fonts)
      .then(() => {
        if (current) setStatus("loaded");
      })
      .catch(() => {
        if (current) setStatus("failed");
      })
      .finally(() => window.clearTimeout(slowTimer));
    return () => {
      current = false;
      window.clearTimeout(slowTimer);
    };
  }, [fontKey, hasRemoteFonts, requested, renderer.fonts, retry]);

  return {
    elementRef,
    status,
    activate: () => setRequested(true),
    retry: () => setRetry((value) => value + 1),
  };
}
