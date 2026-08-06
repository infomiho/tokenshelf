import type { ComponentPropsWithoutRef } from "react";

export type StatusBadgeTone = "neutral" | "brand" | "positive" | "caution" | "negative";

export const statusToneClassNames: Record<StatusBadgeTone, string> = {
  neutral: "bg-surface-subtle text-muted",
  brand: "bg-brand-soft text-brand",
  positive: "bg-positive-soft text-positive",
  caution: "bg-caution-soft text-caution",
  negative: "bg-negative-soft text-negative",
};

export type StatusBadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: StatusBadgeTone;
};

export function StatusBadge({ tone = "neutral", className = "", ...props }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-h-[var(--badge-height)] items-center rounded-[var(--radius-round)] px-2.5 text-xs font-semibold ${statusToneClassNames[tone]} ${className}`}
      {...props}
    />
  );
}
