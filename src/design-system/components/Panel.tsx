import type { ComponentPropsWithoutRef } from "react";

export type PanelTone = "surface" | "subtle" | "feature";
export type PanelRadius = "card" | "hero" | "technical";
export type PanelElevation = "none" | "raised" | "floating";

const toneClassNames: Record<PanelTone, string> = {
  surface: "border-line bg-surface text-ink",
  subtle: "border-line bg-surface-subtle text-ink",
  feature: "border-feature-line bg-feature text-on-feature",
};

const radiusClassNames: Record<PanelRadius, string> = {
  card: "rounded-[var(--radius-card)]",
  hero: "rounded-[var(--radius-hero)]",
  technical: "rounded-[var(--radius-technical)]",
};

const elevationClassNames: Record<PanelElevation, string> = {
  none: "",
  raised: "shadow-[var(--elevation-raised)]",
  floating: "shadow-[var(--elevation-floating)]",
};

export type PanelStyleOptions = {
  tone?: PanelTone;
  radius?: PanelRadius;
  elevation?: PanelElevation;
  className?: string;
};

export function panelClassName({
  tone = "surface",
  radius = "card",
  elevation = "none",
  className = "",
}: PanelStyleOptions = {}) {
  return `${radiusClassNames[radius]} border ${toneClassNames[tone]} ${elevationClassNames[elevation]} ${className}`;
}

export type PanelProps = Omit<ComponentPropsWithoutRef<"section">, "className"> & PanelStyleOptions;

export function Panel({ tone, radius, elevation, className, ...props }: PanelProps) {
  return <section className={panelClassName({ tone, radius, elevation, className })} {...props} />;
}
