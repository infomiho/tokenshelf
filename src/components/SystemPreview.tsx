import type { CSSProperties } from "react";
import type { DesignSystem } from "../data/catalog";
import { Button } from "../design-system/components";
import { usePreviewFonts } from "../hooks/usePreviewFonts";
import { LogoMark } from "./LogoMark";
import { SystemComponentSpecimen } from "./SystemComponentSpecimen";
import "./SystemPreview.css";

export type SystemPreviewProjection = "card" | "detail" | "hero";

type SystemPreviewProps = {
  system: DesignSystem;
  projection?: SystemPreviewProjection;
  decorative?: boolean;
};

type PreviewStyle = CSSProperties & {
  "--preview-boundary-color": string;
  "--preview-boundary-radius": string;
  "--preview-canvas": string;
};

export function SystemPreview({
  system,
  projection = "detail",
  decorative = false,
}: SystemPreviewProps) {
  const fonts = usePreviewFonts(system.renderer, projection === "card" ? "visible" : "eager");
  return (
    <div
      ref={fonts.elementRef}
      className="system-preview"
      data-renderer-preview="system"
      data-projection={projection}
      data-decorative={decorative || undefined}
      data-font-status={fonts.status}
      inert={decorative ? true : undefined}
      aria-busy={fonts.status === "loading" || fonts.status === "slow"}
      onPointerEnter={fonts.activate}
      onFocusCapture={fonts.activate}
      style={
        {
          "--preview-boundary-color": system.renderer.colors["text-muted"],
          "--preview-boundary-radius": `${system.renderer.geometry.radius.lg}px`,
          "--preview-canvas": system.renderer.colors.canvas,
        } as PreviewStyle
      }
    >
      <SystemComponentSpecimen
        renderer={system.renderer}
        projection={projection}
        decorative={decorative}
      />
      {fonts.status !== "loaded" && (
        <div className="preview-font-state" aria-hidden={decorative || undefined}>
          {(fonts.status === "loading" || fonts.status === "slow") && (
            <LogoMark className="waiting-logo size-8 text-brand" aria-hidden="true" />
          )}
          {(fonts.status === "loading" || fonts.status === "slow") && !decorative && (
            <span className="sr-only">Loading preview fonts</span>
          )}
          {fonts.status === "failed" && <span>Font preview unavailable</span>}
          {fonts.status === "slow" && <span>Preview is taking longer than expected</span>}
          {fonts.status === "failed" && !decorative && (
            <Button variant="secondary" size="compact" onClick={fonts.retry}>
              Retry
            </Button>
          )}
        </div>
      )}
      <span className="preview-boundary" aria-hidden="true">
        <span className="preview-boundary-label">Preview</span>
      </span>
    </div>
  );
}
