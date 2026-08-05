import { FigmaMark } from "./FigmaMark";

export function DesignSourcesVisual() {
  return (
    <span className="relative block h-16 w-[5.25rem]">
      <span className="absolute bottom-0 start-0 grid size-11 -rotate-6 place-items-center rounded-[var(--radius-technical)] border border-line bg-surface shadow-sm">
        <span className="block size-6 border border-ink">
          <i className="block h-1.5 border-b border-ink" />
        </span>
      </span>
      <span className="absolute end-0 top-0 z-10 grid size-12 rotate-3 place-items-center rounded-[var(--radius-technical)] border border-line bg-surface shadow-sm">
        <FigmaMark className="h-9 w-auto" />
      </span>
    </span>
  );
}
