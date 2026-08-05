import { useParams } from "react-router";
import { useAuth } from "wasp/client/auth";
import { getSystem, getViewerVotes, useQuery } from "wasp/client/operations";
import { Link } from "wasp/client/router";
import { AppShell } from "../components/AppShell";
import { LoadingPage } from "../components/LoadingPage";
import { NotFoundContent } from "../components/NotFoundContent";
import { SystemActions } from "../components/SystemActions";
import { SystemDetails } from "../components/SystemDetails";
import { SystemMetadata } from "../components/SystemMetadata";
import { SystemPreview } from "../components/SystemPreview";
import { PageContainer, typographyClassName } from "../design-system/components";

export function SystemPage() {
  const { systemId } = useParams<"systemId">();
  const auth = useAuth();
  const systemQueryId = systemId ?? "";
  const isSignedIn = Boolean(auth.data);
  const systemQuery = useQuery(
    getSystem,
    { systemId: systemQueryId },
    { enabled: Boolean(systemId) },
  );
  const votesQuery = useQuery(getViewerVotes, undefined, { enabled: isSignedIn });
  const storedSystem = systemQuery.data;
  const votedIds = new Set(votesQuery.data ?? []);
  const hasViewerVote = Boolean(storedSystem?.databaseId && votedIds.has(storedSystem.databaseId));
  const system = storedSystem ? { ...storedSystem, voted: hasViewerVote } : null;
  const voteStateIsLoading = auth.isLoading || (isSignedIn && votesQuery.isLoading);

  if (systemQuery.isLoading || voteStateIsLoading) {
    return <LoadingPage label="Loading design system" />;
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
                      {publishedAt.toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </time>
                  </span>
                )}
              </p>
            )}
          </header>
        </div>
        <SystemActions system={system} systemQueryId={systemQueryId} />

        <div className="mt-6 overflow-hidden rounded-[var(--radius-hero)]">
          <SystemPreview system={system} projection="detail" />
        </div>

        <SystemDetails system={system} />
        <SystemMetadata system={system} />
      </PageContainer>
    </AppShell>
  );
}
