import { Link } from "wasp/client/router";
import { getCatalogHome, useQuery } from "wasp/client/operations";
import { AppShell } from "../components/AppShell";
import { LoadingPage } from "../components/LoadingPage";
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

  if (catalog.isLoading) return <LoadingPage label="Loading featured design systems" />;
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

  if (!dailyPick) {
    const hasPublishedSystems = catalog.data?.hasPublishedSystems ?? false;
    return (
      <AppShell>
        <PageContainer className="pb-16 pt-6 sm:pt-10">
          <EmptyState
            headingLevel="h1"
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
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageContainer className="pb-16 pt-2 sm:pt-4">
        <SubmissionBanner />
        <DailyPickFeature system={dailyPick} />

        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className={typographyClassName("sectionTitle")}>Previous picks</h2>
            <Link
              to="/hot"
              className="text-sm font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              View today&apos;s race
            </Link>
          </div>
          <div className="timeline-grid no-scrollbar -mr-5 flex snap-x gap-4 overflow-x-auto pr-5 sm:-mr-8 sm:pr-8 lg:-mr-12 lg:pr-12">
            {previousPicks.map((system) => (
              <div key={system.id} className="w-[82vw] max-w-[350px] shrink-0 snap-start">
                <p className={typographyClassName("metaLabel", "mb-2 text-muted")}>
                  {system.pickedOn ? (
                    <time dateTime={system.pickedOn}>{formatCalendarDate(system.pickedOn)}</time>
                  ) : (
                    "Recent"
                  )}
                </p>
                <SystemCard system={system} />
              </div>
            ))}
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}
