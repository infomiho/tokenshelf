import { useParams } from "react-router";
import { getCapabilityPreview, useQuery } from "wasp/client/operations";
import { AppShell } from "../components/AppShell";
import { SystemDetails } from "../components/SystemDetails";
import { SystemPreview } from "../components/SystemPreview";
import { LoadingPage } from "../components/LoadingPage";
import { PageContainer, typographyClassName } from "../design-system/components";

export function AgentPreviewPage() {
  const { capability = "" } = useParams<"capability">();
  const query = useQuery(
    getCapabilityPreview,
    { capability },
    { enabled: Boolean(capability), refetchInterval: 2_500 },
  );
  if (query.isLoading) return <LoadingPage label="Loading preview" />;
  if (query.error || !query.data)
    return (
      <AppShell>
        <section className="grid min-h-[60vh] place-items-center p-6 text-center" role="alert">
          This agent preview is unavailable or has expired.
        </section>
      </AppShell>
    );
  const workspace = query.data;
  return (
    <AppShell>
      <PageContainer className="pb-20 pt-8">
        <h1 className={typographyClassName("pageTitle")}>{workspace.system.name}</h1>
        <p className={typographyClassName("pageLede")}>
          Live submission preview, revision {workspace.revision}.
        </p>
        <div className="mt-8 overflow-hidden rounded-[var(--radius-hero)]">
          <SystemPreview system={workspace.system} projection="detail" />
        </div>
        <SystemDetails system={workspace.system} />
      </PageContainer>
    </AppShell>
  );
}
