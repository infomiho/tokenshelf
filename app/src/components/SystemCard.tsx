import { Link } from "wasp/client/router";
import type { SystemCardData } from "../data/catalog";
import { panelClassName } from "../design-system/components";
import { formatCount } from "../lib/counts";
import { SystemPreview } from "./SystemPreview";

const metricBadgeClassName =
  "inline-flex min-h-[var(--badge-height)] items-center whitespace-nowrap rounded-[var(--radius-round)] border border-line px-2 shadow-[var(--shadow-raised)]";

export function SystemCard({ system }: { system: SystemCardData }) {
  return (
    <article
      className={panelClassName({ className: "min-w-0 transition-colors hover:border-ink/40" })}
    >
      <Link
        to="/systems/:slug"
        params={{ slug: system.id }}
        aria-label={`View ${system.name}`}
        className="block rounded-[var(--radius-card)] text-inherit no-underline"
      >
        <SystemCardContent system={system} />
      </Link>
    </article>
  );
}

function SystemCardContent({ system }: { system: SystemCardData }) {
  const hasMetrics = system.copies > 0 || system.votes > 0;

  return (
    <>
      <div className="relative">
        <SystemPreview system={system} projection="card" decorative />
        <div className="absolute inset-x-3 top-3 flex flex-wrap items-center justify-end gap-1.5 text-[0.6875rem] font-semibold tabular-nums text-muted">
          {hasMetrics ? (
            <>
              <span className={`${metricBadgeClassName} bg-surface`}>
                {formatCount(system.copies, "copy", "copies")}
              </span>
              <span className={`${metricBadgeClassName} bg-brand-soft text-brand`}>
                {formatCount(system.votes, "like")}
              </span>
            </>
          ) : (
            <span className={`${metricBadgeClassName} bg-brand-soft text-brand`}>New</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="card-title text-lg text-ink">{system.name}</h3>
        <p className="mt-1 truncate text-sm text-muted">{system.tags.join(" / ")}</p>
      </div>
    </>
  );
}
