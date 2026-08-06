import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundations/Design tokens",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const colors = [
  ["Paper", "--paper"],
  ["Surface", "--surface"],
  ["Surface subtle", "--surface-subtle"],
  ["Ink", "--ink"],
  ["Muted", "--muted"],
  ["Line", "--line"],
  ["Feature", "--feature"],
  ["On feature", "--on-feature"],
  ["Brand", "--brand"],
  ["Brand soft", "--brand-soft"],
  ["Positive", "--positive"],
  ["Positive soft", "--positive-soft"],
  ["Caution", "--caution"],
  ["Caution soft", "--caution-soft"],
  ["Negative", "--negative"],
  ["Negative soft", "--negative-soft"],
] as const;

const typeStyles = [
  ["Page title", "var(--font-brand)", "3.75rem", "900", "0.98"],
  ["Section title", "var(--font-heading)", "2rem", "var(--weight-heading)", "1.08"],
  ["Body large", "var(--font-ui)", "var(--font-size-body-lg)", "var(--weight-body)", "1.65"],
  ["Body", "var(--font-ui)", "var(--font-size-body)", "var(--weight-body)", "1.5"],
  ["Body small", "var(--font-ui)", "var(--font-size-body-sm)", "var(--weight-body)", "1.5"],
  ["Caption", "var(--font-ui)", "var(--font-size-caption)", "var(--weight-body)", "1.5"],
  ["Label", "var(--font-code)", "var(--font-size-label)", "var(--weight-label)", "1.2"],
] as const;

const tokenCardStyle: CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: "var(--radius-card)",
  background: "var(--surface)",
  padding: "1rem",
};

function FoundationSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-title`}>
      <h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-title`} className="section-title mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

export const Colors: Story = {
  render: () => (
    <FoundationSection title="Color roles">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4">
        {colors.map(([name, token]) => (
          <figure
            key={token}
            className="m-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface"
          >
            <div
              className="h-24 border-b border-line"
              style={{ backgroundColor: `var(${token})` }}
              role="img"
              aria-label={`${name} color swatch`}
            />
            <figcaption className="grid gap-1 p-3">
              <strong className="text-sm">{name}</strong>
              <code className="text-xs text-muted">{token}</code>
            </figcaption>
          </figure>
        ))}
      </div>
    </FoundationSection>
  ),
};

export const Typography: Story = {
  render: () => (
    <FoundationSection title="Type scale">
      <div className="grid gap-3">
        {typeStyles.map(([name, family, size, weight, lineHeight]) => (
          <article
            key={name}
            className="grid gap-3 border-b border-line py-5 md:grid-cols-[10rem_1fr]"
          >
            <div className="grid content-start gap-1 text-xs text-muted">
              <strong className="text-ink">{name}</strong>
              <code>{size}</code>
            </div>
            <p
              className="m-0"
              style={{ fontFamily: family, fontSize: size, fontWeight: weight, lineHeight }}
            >
              Tokens give interfaces a distinct voice.
            </p>
          </article>
        ))}
      </div>
    </FoundationSection>
  ),
};

const controlSizes = [
  ["Compact", "--control-height-compact"],
  ["Default", "--control-height-default"],
  ["Touch", "--control-height-touch"],
] as const;

export const ControlSizesAndSpacing: Story = {
  render: () => (
    <div className="grid gap-12">
      <FoundationSection title="Control sizes">
        <div className="grid gap-4">
          {controlSizes.map(([name, token]) => (
            <div key={token} className="grid items-center gap-3 sm:grid-cols-[7rem_1fr_12rem]">
              <strong className="text-sm">{name}</strong>
              <div
                className="rounded-[var(--radius-control)] bg-brand-soft"
                style={{ height: `var(${token})` }}
              />
              <code className="text-xs text-muted">{token}</code>
            </div>
          ))}
        </div>
      </FoundationSection>
      <FoundationSection title="Layout spacing">
        <div className="grid gap-5">
          <div style={tokenCardStyle}>
            <div className="mb-3 flex justify-between gap-4 text-sm">
              <strong>Responsive page gutter</strong>
              <code className="text-muted">--layout-gutter</code>
            </div>
            <div className="bg-surface-subtle px-[var(--layout-gutter)] py-4">
              <div className="h-10 rounded-[var(--radius-inset)] bg-brand-soft" />
            </div>
          </div>
          <div
            className="grid grid-cols-3 gap-3"
            role="group"
            aria-label="Common component spacing examples"
          >
            {["gap-1.5", "gap-3", "gap-5"].map((gap, index) => (
              <div key={gap} style={tokenCardStyle}>
                <code className="mb-3 block text-xs text-muted">{gap}</code>
                <div className={`grid ${gap}`}>
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="h-3 rounded-full bg-ink" />
                  ))}
                </div>
                <span className="sr-only">{[6, 12, 20][index]} pixel gap</span>
              </div>
            ))}
          </div>
        </div>
      </FoundationSection>
    </div>
  ),
};

const radii = [
  ["Technical", "--radius-technical"],
  ["Inset", "--radius-inset"],
  ["Control", "--radius-control"],
  ["Card", "--radius-card"],
  ["Hero", "--radius-hero"],
  ["Round", "--radius-round"],
] as const;

export const Radii: Story = {
  render: () => (
    <FoundationSection title="Corner radii">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-5">
        {radii.map(([name, token]) => (
          <div key={token} className="grid gap-3 text-center">
            <div
              className="h-28 border-2 border-brand bg-brand-soft"
              style={{ borderRadius: `var(${token})` }}
            />
            <strong className="text-sm">{name}</strong>
            <code className="text-xs text-muted">{token}</code>
          </div>
        ))}
      </div>
    </FoundationSection>
  ),
};

const elevations = [
  ["Raised", "--elevation-raised"],
  ["Floating", "--elevation-floating"],
  ["Overlay", "--elevation-overlay"],
] as const;

export const Elevation: Story = {
  render: () => (
    <FoundationSection title="Elevation">
      <div className="grid gap-10 bg-surface-subtle p-8 sm:grid-cols-3 sm:p-12">
        {elevations.map(([name, token]) => (
          <article
            key={token}
            className="grid min-h-40 place-content-center gap-2 rounded-[var(--radius-card)] bg-surface p-5 text-center"
            style={{ boxShadow: `var(${token})` }}
          >
            <strong>{name}</strong>
            <code className="text-xs text-muted">{token}</code>
          </article>
        ))}
      </div>
    </FoundationSection>
  ),
};
