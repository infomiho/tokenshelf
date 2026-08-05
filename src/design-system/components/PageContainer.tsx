import type { ComponentPropsWithoutRef } from "react";

export type PageContainerProps = ComponentPropsWithoutRef<"div"> & {
  width?: "page" | "content" | "prose";
};

const widthClassNames: Record<NonNullable<PageContainerProps["width"]>, string> = {
  page: "max-w-[var(--layout-max)]",
  content: "max-w-[var(--layout-content-max)]",
  prose: "max-w-[var(--layout-prose-max)]",
};

export function PageContainer({ width = "page", className = "", ...props }: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-[var(--layout-gutter)] ${widthClassNames[width]} ${className}`}
      {...props}
    />
  );
}
