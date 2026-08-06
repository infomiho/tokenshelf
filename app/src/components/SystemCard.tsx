import { Link } from "wasp/client/router";
import type { SystemCardData } from "../data/catalog";
import { panelClassName } from "../design-system/components";
import { formatCount } from "../lib/counts";
import { SystemPreview } from "./SystemPreview";

export function SystemCard({
  system,
  stat = "copies",
}: {
  system: SystemCardData;
  stat?: "copies" | "today" | "votes";
}) {
  return (
    <article className={panelClassName({ className: "transition-colors hover:border-ink/40" })}>
      <Link
        to="/systems/:slug"
        params={{ slug: system.id }}
        aria-label={`View ${system.name}`}
        className="block rounded-[var(--radius-card)] text-inherit no-underline"
      >
        <SystemCardContent system={system} stat={stat} />
      </Link>
    </article>
  );
}

function SystemCardContent({
  system,
  stat,
}: {
  system: SystemCardData;
  stat: "copies" | "today" | "votes";
}) {
  return (
    <>
      <SystemPreview system={system} projection="card" decorative />
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="card-title text-lg text-ink">{system.name}</h3>
          <span className="shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-muted">
            {stat === "votes"
              ? formatCount(system.votes, "vote")
              : stat === "today"
                ? `${system.todayCopies} today`
                : formatCount(system.copies, "copy", "copies")}
          </span>
        </div>
        <p className="no-scrollbar mt-1 overflow-x-auto whitespace-nowrap text-sm text-muted">
          {system.tags.join(" / ")}
        </p>
      </div>
    </>
  );
}
