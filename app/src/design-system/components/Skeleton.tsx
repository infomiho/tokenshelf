import type { ComponentPropsWithoutRef } from "react";

export type SkeletonProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  tone?: "surface" | "feature";
};

export function Skeleton({ tone = "surface", className = "", ...props }: SkeletonProps) {
  return (
    <span
      className={`skeleton block ${className}`}
      data-tone={tone}
      aria-hidden="true"
      {...props}
    />
  );
}
