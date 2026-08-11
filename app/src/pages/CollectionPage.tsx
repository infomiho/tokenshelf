import { Link } from "wasp/client/router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getTagSuggestions, listSystems, useQuery } from "wasp/client/operations";
import { AppShell } from "../components/AppShell";
import { BrowseToolbar } from "../components/BrowseToolbar";
import { SystemCard } from "../components/SystemCard";
import { PageMessage } from "../components/PageMessage";
import { CatalogGridSkeleton } from "../catalog/Skeletons";
import {
  actionLinkClassName,
  Button,
  LoadingIndicator,
  PageContainer,
  typographyClassName,
} from "../design-system/components";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useSystemSearch } from "../hooks/useSystemSearch";

const pageSize = 24;

export function CollectionPage({ mode }: { mode: "hot" | "new" }) {
  const search = useSystemSearch();
  const catalog = useInfiniteQuery({
    queryKey: [...listSystems.queryCacheKey, mode, search.deferredQuery],
    queryFn: ({ pageParam = 1 }) =>
      listSystems({
        mode,
        query: search.deferredQuery || undefined,
        page: pageParam,
        pageSize,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined,
    keepPreviousData: true,
  });
  const tags = useQuery(getTagSuggestions);
  const systems = catalog.data?.pages.flatMap(({ items }) => items) ?? [];
  const total = catalog.data?.pages[0]?.total ?? 0;
  const systemCountLabel =
    systems.length === total
      ? `${total} ${total === 1 ? "system" : "systems"}`
      : `${systems.length} of ${total} systems`;
  const title = mode === "hot" ? "Today's race" : "Fresh on the shelf";
  const description =
    mode === "hot"
      ? "Daily votes reset at midnight. The leader becomes tomorrow's daily pick."
      : "Every published system starts here, ordered by arrival.";
  useDocumentTitle(`${mode === "hot" ? "Hot" : "New"} | Tokenshelf`);

  if (catalog.error && !catalog.data) {
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
          query={search.query}
          onQueryChange={search.setQuery}
          tagSuggestions={tags.data ?? []}
        />
        <p className="sr-only" aria-live="polite">
          {!catalog.isFetching &&
            (systems.length > 0
              ? `${systemCountLabel} shown.`
              : search.deferredQuery
                ? `No systems match ${search.deferredQuery}.`
                : "No systems yet.")}
        </p>
        <div>
          {catalog.isLoading ? (
            <CatalogGridSkeleton />
          ) : systems.length > 0 ? (
            <>
              <div className="mt-8 flex items-center justify-between gap-4">
                <h2 className={typographyClassName("sectionTitle", "text-xl")}>
                  {systemCountLabel}
                </h2>
                <div className="flex items-center gap-3">
                  {catalog.isFetching && !catalog.isFetchingNextPage && (
                    <LoadingIndicator label="Updating systems" size="compact" />
                  )}
                  <span className={typographyClassName("metaLabel", "text-muted")}>
                    {mode === "hot" ? "Sorted by votes" : "Newest first"}
                  </span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {systems.map((system) => (
                  <SystemCard key={system.id} system={system} />
                ))}
              </div>
              {catalog.hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="secondary"
                    className="min-w-32"
                    disabled={catalog.isFetchingNextPage}
                    onClick={() => {
                      void catalog.fetchNextPage();
                    }}
                  >
                    {catalog.isFetchingNextPage ? (
                      <LoadingIndicator label="Loading more systems" size="compact" />
                    ) : (
                      `Load ${Math.min(pageSize, total - systems.length)} more`
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-14 border-t border-line pt-8">
              <h2 className={typographyClassName("sectionTitle", "text-2xl")}>
                {search.isFiltering ? `No systems match “${search.query}”.` : "No systems yet"}
              </h2>
              {search.isFiltering ? (
                <Button
                  variant="quiet"
                  size="compact"
                  className="mt-3 underline underline-offset-4"
                  onClick={search.clearFilters}
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
