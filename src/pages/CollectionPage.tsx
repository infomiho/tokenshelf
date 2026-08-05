import { Link } from "wasp/client/router";
import { listSystems, useQuery } from "wasp/client/operations";
import { AppShell } from "../components/AppShell";
import { BrowseToolbar } from "../components/BrowseToolbar";
import { LoadingPage } from "../components/LoadingPage";
import { SystemCard } from "../components/SystemCard";
import { PageMessage } from "../components/PageMessage";
import {
  actionLinkClassName,
  Button,
  PageContainer,
  typographyClassName,
} from "../design-system/components";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useSystemFilters } from "../hooks/useSystemFilters";

export function CollectionPage({ mode }: { mode: "hot" | "new" }) {
  const catalog = useQuery(listSystems, { mode, pageSize: 50 });
  const systems = catalog.data?.items ?? [];
  const filters = useSystemFilters(systems);
  const sortedSystems = filters.filteredSystems;
  const title = mode === "hot" ? "Today's race" : "Fresh on the shelf";
  const description =
    mode === "hot"
      ? "Daily votes reset at midnight. The leader becomes tomorrow's daily pick."
      : "Every published system starts here, ordered by arrival.";
  useDocumentTitle(`${mode === "hot" ? "Hot" : "New"} | Tokenshelf`);

  if (catalog.isLoading) return <LoadingPage label="Loading design systems" />;
  if (catalog.error) {
    return (
      <AppShell>
        <PageMessage
          title="Unable to load systems"
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

  return (
    <AppShell>
      <PageContainer className="pb-16 pt-10">
        <div className="mb-9 grid gap-4 md:grid-cols-[1fr_0.7fr] md:items-end">
          <h1 className={typographyClassName("pageTitle")}>{title}</h1>
          <p className={typographyClassName("pageLede", "mt-0 max-w-lg md:justify-self-end")}>
            {description}
          </p>
        </div>
        <BrowseToolbar
          query={filters.query}
          onQueryChange={filters.setQuery}
          vibe={filters.vibe}
          onVibeChange={filters.setVibe}
        />
        <p className="sr-only" aria-live="polite">
          {sortedSystems.length > 0
            ? `${sortedSystems.length} ${sortedSystems.length === 1 ? "system" : "systems"} shown.`
            : `No systems match ${filters.query || filters.vibe}.`}
        </p>
        <div>
          {sortedSystems.length > 0 ? (
            <>
              <div className="mt-8 flex items-center justify-between gap-4">
                <h2 className={typographyClassName("sectionTitle", "text-xl")}>
                  {sortedSystems.length} {sortedSystems.length === 1 ? "system" : "systems"}
                </h2>
                <span className={typographyClassName("metaLabel", "text-muted")}>
                  {mode === "hot" ? "Sorted by votes" : "Newest first"}
                </span>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {sortedSystems.map((system) => (
                  <SystemCard key={system.id} system={system} stat="votes" />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-14 border-t border-line pt-8">
              <h2 className={typographyClassName("sectionTitle", "text-2xl")}>
                {filters.isFiltering
                  ? `No systems match “${filters.query || filters.vibe}”.`
                  : "No systems yet"}
              </h2>
              {filters.isFiltering ? (
                <Button
                  variant="quiet"
                  size="compact"
                  className="mt-3 underline underline-offset-4"
                  onClick={filters.clearFilters}
                >
                  Clear filters
                </Button>
              ) : (
                <Link
                  to="/submit/:submissionId?"
                  params={{}}
                  className={actionLinkClassName("primary", "mt-5")}
                >
                  Start a submission
                </Link>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </AppShell>
  );
}
