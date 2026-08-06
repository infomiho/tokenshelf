import { Link } from "wasp/client/router";
import { getCatalogHome, useQuery } from "wasp/client/operations";
import { AppShell } from "../components/AppShell";
import { DailyPickFeature } from "../components/DailyPickFeature";
import { EmptyState } from "../components/EmptyState";
import { SubmissionBanner } from "../components/SubmissionBanner";
import { SystemCard } from "../components/SystemCard";
import { PageMessage } from "../components/PageMessage";
import {
  actionLinkClassName,
  Button,
  PageContainer,
  typographyClassName,
} from "../design-system/components";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatCalendarDate } from "../lib/dates";
import { LandingPageSkeleton } from "../catalog/Skeletons";
import { selectHomeSystemRow } from "../catalog/home";
import type { SystemCardData } from "../data/catalog";

export function LandingPage() {
  return (
    <>
      <link rel="canonical" href="https://tokenshelf.dev/" />
      <meta property="og:url" content="https://tokenshelf.dev/" />
      <LandingContent />
    </>
  );
}

function LandingContent() {
  useDocumentTitle("Top picks | Tokenshelf");
  const catalog = useQuery(getCatalogHome);

  if (catalog.isLoading) return <LandingPageSkeleton />;
  if (catalog.error) {
    return (
      <AppShell>
        <PageMessage
          title="Unable to load Tokenshelf"
          description="Check your connection and try again."
          action={
            <Button
              onClick={() => {
                void catalog.refetch();
              }}
            >
              Try again
            </Button>
          }
        />
      </AppShell>
    );
  }

  const dailyPick = catalog.data?.dailyPick ?? null;
  const previousPicks = catalog.data?.previousPicks ?? [];
  const secondaryRow = selectHomeSystemRow(
    dailyPick,
    previousPicks,
    catalog.data?.latestSystems ?? [],
  );
  const hasPublishedSystems = catalog.data?.hasPublishedSystems ?? false;

  return (
    <AppShell>
      <PageContainer className="pb-16 pt-2 sm:pt-4">
        <SubmissionBanner />
        {dailyPick ? (
          <DailyPickFeature system={dailyPick} />
        ) : (
          <EmptyState
            headingLevel="h1"
            className="mt-8"
            title={
              hasPublishedSystems
                ? "Today’s pick is still being decided"
                : "The shelf is ready for its first system"
            }
            description={
              hasPublishedSystems
                ? "Vote in today’s race or browse the newest systems while the next winner is chosen."
                : "Submit an original design system to start the first daily race."
            }
            action={
              hasPublishedSystems ? (
                <div className="flex flex-wrap gap-3">
                  <Link to="/hot" className={actionLinkClassName("onDark")}>
                    View today&apos;s race
                  </Link>
                  <Link to="/new" className={actionLinkClassName("onDarkSecondary")}>
                    Browse new systems
                  </Link>
                </div>
              ) : (
                <Link
                  to="/submit/:submissionId?"
                  params={{}}
                  className={actionLinkClassName("onDark")}
                >
                  Submit a system
                </Link>
              )
            }
          />
        )}
        {secondaryRow && <HomeSystemRow systems={secondaryRow.systems} kind={secondaryRow.kind} />}
      </PageContainer>
    </AppShell>
  );
}

function HomeSystemRow({
  systems,
  kind,
}: {
  systems: SystemCardData[];
  kind: "previous" | "latest";
}) {
  const isPrevious = kind === "previous";
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className={typographyClassName("sectionTitle")}>
          {isPrevious ? "Previous picks" : "Latest systems"}
        </h2>
        <Link
          to={isPrevious ? "/hot" : "/new"}
          className="text-sm font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
        >
          {isPrevious ? "View today’s race" : "View all new systems"}
        </Link>
      </div>
      <div className="timeline-grid no-scrollbar -mr-5 flex snap-x gap-4 overflow-x-auto pr-5 sm:-mr-8 sm:pr-8 lg:-mr-12 lg:pr-12">
        {systems.map((system) => {
          return (
            <div key={system.id} className="w-[82vw] max-w-[350px] shrink-0 snap-start">
              {isPrevious && (
                <p className={typographyClassName("metaLabel", "mb-2 text-muted")}>
                  {system.pickedOn ? (
                    <time dateTime={system.pickedOn}>{formatCalendarDate(system.pickedOn)}</time>
                  ) : (
                    "Recent"
                  )}
                </p>
              )}
              <SystemCard system={system} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
