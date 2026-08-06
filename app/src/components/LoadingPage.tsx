import { AppShell } from "./AppShell";
import { LoadingIndicator } from "../design-system/components";

export function LoadingPage({ label }: { label: string }) {
  return (
    <AppShell mainClassName="grid place-items-center">
      <LoadingIndicator label={label} />
    </AppShell>
  );
}
