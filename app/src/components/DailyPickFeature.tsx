import { Link } from "wasp/client/router";
import type { SystemCardData } from "../data/catalog";
import { actionLinkClassName } from "../design-system/components";
import { CopyPromptButton } from "./CopyPromptButton";
import { SystemPreview } from "./SystemPreview";

export function DailyPickFeature({ system }: { system: SystemCardData }) {
  return (
    <article className="mt-8 grid overflow-hidden rounded-[var(--radius-hero)] border border-feature-line bg-feature lg:grid-cols-[0.8fr_1.2fr]">
      <div className="flex flex-col justify-between gap-10 p-6 text-on-feature sm:p-8 lg:p-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="meta-label text-on-feature">Pick of the day</span>
          </div>
          <h1 className="feature-title mt-6">{system.name}</h1>
          <p className="mt-4 max-w-md text-lg leading-7 text-on-feature-muted text-pretty">
            {system.description}
          </p>
          <div className="meta-label mt-6 flex flex-wrap gap-3 text-on-feature-muted">
            {system.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CopyPromptButton system={system} variant="onDark" className="sm:min-w-48" />
            <Link
              to="/systems/:slug"
              params={{ slug: system.id }}
              className={actionLinkClassName("onDarkSecondary")}
            >
              View system
            </Link>
          </div>
        </div>
      </div>
      <div
        className="relative h-[26rem] min-w-0 overflow-hidden border-t border-feature-line sm:h-[32rem] lg:h-[36rem] lg:border-l lg:border-t-0"
        style={{ background: system.renderer.colors.canvas }}
      >
        <SystemPreview system={system} projection="hero" decorative />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 sm:h-48"
          style={{
            background: `linear-gradient(to bottom, transparent, ${system.renderer.colors.canvas})`,
          }}
          aria-hidden="true"
        />
      </div>
    </article>
  );
}
