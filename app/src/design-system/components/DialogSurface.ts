export type DialogSurfacePart = "backdrop" | "viewport" | "popup";

const dialogSurfaceClassNames: Record<DialogSurfacePart, string> = {
  backdrop: "fixed inset-0 z-[var(--z-overlay)] bg-ink/35",
  viewport:
    "fixed inset-0 z-[var(--z-overlay)] grid place-items-center overflow-y-auto p-[var(--layout-gutter)]",
  popup:
    "w-[calc(100vw-2rem)] max-w-[40rem] rounded-[var(--radius-card)] bg-paper p-6 text-ink shadow-[var(--elevation-overlay)] outline-none",
};

export function dialogSurfaceClassName(part: DialogSurfacePart, className = "") {
  return `${dialogSurfaceClassNames[part]} ${className}`;
}
