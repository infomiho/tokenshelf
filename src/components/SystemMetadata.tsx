import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import type { DesignSystem } from "../data/catalog";
import { StatusBadge } from "../design-system/components";

export function SystemMetadata({ system }: { system: DesignSystem }) {
  return (
    <section className="mt-12 border-t border-line pt-6" aria-labelledby="system-metadata-heading">
      <h2 id="system-metadata-heading" className="sr-only">
        System metadata
      </h2>
      <dl className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
        <MetadataItem label="Tags">
          <ul className="flex flex-wrap gap-2">
            {system.tags.map((tag) => (
              <li key={tag}>
                <StatusBadge className="text-sm font-medium">{tag}</StatusBadge>
              </li>
            ))}
          </ul>
        </MetadataItem>
        {system.inspiration && (
          <MetadataItem label="License">
            <a
              href={system.inspiration.licenseUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-brand"
            >
              {system.inspiration.license}
              <ArrowSquareOutIcon className="size-3.5 text-muted" aria-hidden="true" />
            </a>
          </MetadataItem>
        )}
      </dl>
    </section>
  );
}

function MetadataItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className="mt-2">{children}</dd>
    </div>
  );
}
