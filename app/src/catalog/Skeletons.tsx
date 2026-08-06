import { AppShell } from "../components/AppShell";
import { PageContainer, panelClassName, Skeleton } from "../design-system/components";

export function SystemCardSkeleton() {
  return (
    <div className={panelClassName({ className: "overflow-hidden" })} aria-hidden="true">
      <Skeleton className="aspect-video min-h-[10.5rem] rounded-t-[calc(var(--radius-card)-1px)]" />
      <div className="p-4">
        <div className="flex items-center justify-between gap-5">
          <Skeleton className="h-5 w-2/5 rounded-sm" />
          <Skeleton className="h-3 w-14 rounded-sm" />
        </div>
        <Skeleton className="mt-3 h-3 w-3/5 rounded-sm" />
      </div>
    </div>
  );
}

export function CatalogGridSkeleton() {
  return (
    <div className="mt-8" role="status" aria-label="Loading systems" aria-busy="true">
      <span className="sr-only">Loading systems</span>
      <div className="flex items-center justify-between gap-4" aria-hidden="true">
        <Skeleton className="h-6 w-32 rounded-sm" />
        <Skeleton className="h-3 w-20 rounded-sm" />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <SystemCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function LandingPageSkeleton() {
  return (
    <AppShell>
      <PageContainer className="pb-16 pt-8 sm:pt-12" aria-busy="true">
        <span className="sr-only" role="status">
          Loading featured design systems
        </span>
        <div className="grid min-h-[32rem] overflow-hidden rounded-[var(--radius-hero)] border border-feature-line bg-feature lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10">
            <div>
              <Skeleton tone="feature" className="h-3 w-24 rounded-sm" />
              <Skeleton tone="feature" className="mt-8 h-11 w-3/5 rounded-sm" />
              <Skeleton tone="feature" className="mt-5 h-4 w-full max-w-sm rounded-sm" />
              <Skeleton tone="feature" className="mt-3 h-4 w-4/5 max-w-xs rounded-sm" />
              <Skeleton tone="feature" className="mt-7 h-3 w-48 rounded-sm" />
            </div>
            <div className="flex gap-3">
              <Skeleton tone="feature" className="h-12 w-44 rounded-[var(--radius-control)]" />
              <Skeleton tone="feature" className="h-12 w-32 rounded-[var(--radius-control)]" />
            </div>
          </div>
          <Skeleton
            tone="feature"
            className="min-h-80 border-t border-feature-line lg:border-s lg:border-t-0"
          />
        </div>
        <div className="mt-14" aria-hidden="true">
          <div className="mb-5 flex justify-between gap-4">
            <Skeleton className="h-7 w-36 rounded-sm" />
            <Skeleton className="h-4 w-28 rounded-sm" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <SystemCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}

export function SystemPageSkeleton() {
  return (
    <AppShell>
      <PageContainer className="pb-20 pt-6" aria-busy="true">
        <span className="sr-only" role="status">
          Loading design system
        </span>
        <div className="max-w-2xl" aria-hidden="true">
          <Skeleton className="h-12 w-2/5 rounded-sm" />
          <Skeleton className="mt-4 h-4 w-full rounded-sm" />
          <Skeleton className="mt-3 h-4 w-4/5 rounded-sm" />
          <Skeleton className="mt-5 h-3 w-72 max-w-full rounded-sm" />
        </div>
        <div className="mt-6 flex gap-3" aria-hidden="true">
          <Skeleton className="h-11 w-40 rounded-[var(--radius-control)]" />
          <Skeleton className="h-11 w-28 rounded-[var(--radius-control)]" />
        </div>
        <Skeleton className="mt-6 h-[28rem] rounded-[var(--radius-hero)] sm:h-[36rem]" />
        <div className="mt-14 grid gap-8 lg:grid-cols-2" aria-hidden="true">
          <div>
            <Skeleton className="h-7 w-40 rounded-sm" />
            <Skeleton className="mt-5 h-4 w-full rounded-sm" />
            <Skeleton className="mt-3 h-4 w-5/6 rounded-sm" />
          </div>
          <div>
            <Skeleton className="h-7 w-32 rounded-sm" />
            <Skeleton className="mt-5 h-4 w-full rounded-sm" />
            <Skeleton className="mt-3 h-4 w-3/4 rounded-sm" />
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
