import type { ReactNode } from "react";
import { PageContainer } from "../design-system/components";
import { Header } from "./Header";
import "../design-system/index.css";

export function AppShell({
  children,
  mainClassName = "",
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className={`flex-1 ${mainClassName}`}>
        {children}
      </main>
      <footer>
        <PageContainer className="flex items-center justify-center gap-2 py-8 text-xs text-muted">
          <span>
            Built with{" "}
            <a
              href="https://wasp.sh"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              Wasp
            </a>
          </span>
          <span aria-hidden="true" className="text-line">
            /
          </span>
          <a
            href="https://github.com/infomiho/tokenshelf"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            Check the source code
          </a>
        </PageContainer>
      </footer>
    </div>
  );
}
