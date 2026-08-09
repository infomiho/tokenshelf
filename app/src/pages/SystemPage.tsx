import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { useLocation, useParams } from "react-router";
import { useAuth } from "wasp/client/auth";
import { getSystem, getViewerVotes, useQuery } from "wasp/client/operations";
import { Link } from "wasp/client/router";
import { AppShell } from "../components/AppShell";
import { SystemPageSkeleton } from "../catalog/Skeletons";
import { NotFoundContent } from "../components/NotFoundContent";
import { SystemActions } from "../components/SystemActions";
import { SystemDetails } from "../components/SystemDetails";
import { SystemMetadata } from "../components/SystemMetadata";
import { SystemPreview } from "../components/SystemPreview";
import { Notice, PageContainer, typographyClassName } from "../design-system/components";
import { formatCalendarDate } from "../lib/dates";

export function SystemPage() {
  const { slug } = useParams<"slug">();
  const location = useLocation();
  const auth = useAuth();
  const systemSlug = slug ?? "";
  const isSignedIn = Boolean(auth.data);
  const systemQuery = useQuery(getSystem, { slug: systemSlug }, { enabled: Boolean(slug) });
  const votesQuery = useQuery(getViewerVotes, undefined, { enabled: isSignedIn });
  const storedSystem = systemQuery.data;
  const votedIds = new Set(votesQuery.data ?? []);
  const hasViewerVote = Boolean(storedSystem?.databaseId && votedIds.has(storedSystem.databaseId));
  const system = storedSystem ? { ...storedSystem, voted: hasViewerVote } : null;
  const voteStateIsLoading = auth.isLoading || (isSignedIn && votesQuery.isLoading);
  const draftWasDiscarded =
    typeof location.state === "object" &&
    location.state !== null &&
    "submissionNotice" in location.state &&
    location.state.submissionNotice === "discarded";

  if (systemQuery.isLoading || voteStateIsLoading) {
    return <SystemPageSkeleton />;
  }

  if (!system) {
    return (
      <AppShell>
        <NotFoundContent />
      </AppShell>
    );
  }
  const publishedAt = system.publishedAt ? new Date(system.publishedAt) : null;
  const hasPublishedAt = publishedAt && !Number.isNaN(publishedAt.getTime());

  return (
    <AppShell>
      <PageContainer className="pb-20 pt-6">
        {draftWasDiscarded && (
          <Notice
            className="mb-6 max-w-2xl"
            tone="positive"
            title="Draft changes discarded"
            description="The published system was not changed. Agent access has ended."
            icon={<CheckCircleIcon className="size-5" weight="fill" />}
            role="status"
          />
        )}
        <div className="max-w-2xl">
          <header>
            <h1 className={typographyClassName("featureTitle")}>{system.name}</h1>
            <p className="mt-2 text-[1.0625rem] leading-[1.5] text-muted text-pretty sm:text-lg">
              {system.description}
            </p>
            {(system.inspiration || system.author || hasPublishedAt) && (
              <p className="mt-4 flex flex-wrap gap-x-2 text-sm leading-6 text-muted">
                {system.inspiration && (
                  <span>
                    Inspired by{" "}
                    <a
                      href={system.inspiration.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-brand"
                    >
                      {system.inspiration.system}
                    </a>
                  </span>
                )}
                {system.inspiration && system.author && <span aria-hidden="true">·</span>}
                {system.author &&
                  (system.author.username ? (
                    <span>
                      Created by{" "}
                      <Link
                        to="/:profileHandle"
                        params={{ profileHandle: `@${system.author.username}` }}
                        className="font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-brand"
                      >
                        {system.author.name}
                      </Link>
                    </span>
                  ) : (
                    <span>
                      Created by{" "}
                      <strong className="font-semibold text-ink">{system.author.name}</strong>
                    </span>
                  ))}
                {(system.inspiration || system.author) && hasPublishedAt && (
                  <span aria-hidden="true">·</span>
                )}
                {hasPublishedAt && (
                  <span>
                    Published{" "}
                    <time dateTime={publishedAt.toISOString()}>
                      {formatCalendarDate(publishedAt)}
                    </time>
                  </span>
                )}
              </p>
            )}
          </header>
        </div>
        <SystemActions system={system} slug={systemSlug} />

        <div className="mt-6 overflow-hidden rounded-[var(--radius-hero)]">
          <SystemPreview system={system} projection="detail" />
        </div>

        <SystemDetails system={system} />
        <SystemMetadata system={system} />
      </PageContainer>
    </AppShell>
  );
}
