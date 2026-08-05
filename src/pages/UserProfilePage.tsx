import { Link } from "wasp/client/router";
import { getUserProfile, useQuery } from "wasp/client/operations";
import { useParams } from "react-router";
import { AppShell } from "../components/AppShell";
import { LoadingPage } from "../components/LoadingPage";
import { LogoMark } from "../components/LogoMark";
import { NotFoundContent } from "../components/NotFoundContent";
import { SystemCard } from "../components/SystemCard";
import { EmptyState } from "../components/EmptyState";
import { PageMessage } from "../components/PageMessage";
import {
  actionLinkClassName,
  Button,
  PageContainer,
  typographyClassName,
} from "../design-system/components";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function UserProfilePage() {
  const { profileHandle } = useParams<"profileHandle">();
  const username = profileHandle?.startsWith("@") ? profileHandle.slice(1) : "";
  const profileQuery = useQuery(getUserProfile, { username }, { enabled: Boolean(username) });
  const profile = profileQuery.data;
  useDocumentTitle(
    profile ? `${profile.name} (@${profile.username}) | Tokenshelf` : "Profile | Tokenshelf",
  );

  if (profileQuery.isLoading) return <LoadingPage label="Loading profile" />;
  if (profileQuery.error) {
    return (
      <AppShell>
        <PageMessage
          title="Unable to load profile"
          description="Check your connection and try again."
          action={<Button onClick={() => void profileQuery.refetch()}>Try again</Button>}
        />
      </AppShell>
    );
  }
  if (!profile) {
    return (
      <AppShell>
        <NotFoundContent />
      </AppShell>
    );
  }

  const systemCount = profile.systems.length;
  return (
    <AppShell>
      <PageContainer width="content" className="pb-24 pt-8">
        <header className="flex items-center gap-4 sm:gap-5">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-subtle outline outline-1 outline-black/10 sm:size-20">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <LogoMark className="size-8 text-brand sm:size-10" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className={typographyClassName("sectionTitle", "break-words text-3xl sm:text-4xl")}>
              {profile.name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              @{profile.username} · <span className="tabular-nums">{systemCount}</span>{" "}
              {systemCount === 1 ? "system" : "systems"}
            </p>
          </div>
        </header>

        {systemCount > 0 ? (
          <section className="mt-10" aria-labelledby="published-systems-heading">
            <h2 id="published-systems-heading" className="sr-only">
              Published systems
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {profile.systems.map((system) => (
                <SystemCard key={system.id} system={system} stat="copies" />
              ))}
            </div>
          </section>
        ) : (
          <EmptyState
            title="No published systems"
            description="Published systems will appear here."
            className="mt-6"
            action={
              <Link to="/" className={actionLinkClassName("onDark")}>
                Browse the library
              </Link>
            }
          />
        )}
      </PageContainer>
    </AppShell>
  );
}
