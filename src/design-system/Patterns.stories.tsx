import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  dialogSurfaceClassName,
  menuItemClassName,
  typographyClassName,
  typographyClassNames,
  type TypographyStyle,
} from "./components";

const meta = {
  title: "Patterns/Class helpers",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const typographySamples: Array<[TypographyStyle, string]> = [
  ["eyebrow", "Curated system"],
  ["metaLabel", "Updated today"],
  ["pageTitle", "Design with a point of view"],
  ["pageLede", "Original visual systems, ready to hand to a coding agent."],
  ["sectionTitle", "Featured systems"],
  ["featureTitle", "A sharper starting point"],
  ["cardTitle", "Editorial contrast"],
];

export const TypographyHelpers: Story = {
  render: () => (
    <section className="grid gap-8" aria-labelledby="type-helper-title">
      <h2 id="type-helper-title" className="section-title">
        Typography class helpers
      </h2>
      {typographySamples.map(([style, copy]) => (
        <div key={style} className="grid gap-2 border-b border-line pb-6">
          <code className="text-xs text-muted">{typographyClassNames[style]}</code>
          <p className={typographyClassName(style, "m-0")}>{copy}</p>
        </div>
      ))}
    </section>
  ),
};

export const MenuItems: Story = {
  render: () => (
    <section
      className="w-72 rounded-[var(--radius-card)] border border-line bg-surface p-1 shadow-[var(--elevation-floating)]"
      aria-label="Example menu"
    >
      <button className={menuItemClassName("w-full")} type="button">
        Open system
      </button>
      <button className={menuItemClassName("w-full", "default")} type="button" data-highlighted>
        Duplicate system
      </button>
      <button className={menuItemClassName("w-full")} type="button" disabled data-disabled>
        Delete system
      </button>
    </section>
  ),
};

export const DialogSurface: Story = {
  render: () => (
    <div className="relative min-h-96 overflow-hidden rounded-[var(--radius-hero)] border border-line">
      <div className={dialogSurfaceClassName("backdrop", "!absolute !z-0")} />
      <div className={dialogSurfaceClassName("viewport", "!absolute !z-0")}>
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          className={dialogSurfaceClassName("popup", "relative")}
        >
          <p className="eyebrow mb-3">Account</p>
          <h2 id="dialog-title" className="section-title">
            Sign in to Tokenshelf
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-6 text-muted">
            Continue with GitHub to vote, submit systems, and manage your profile.
          </p>
        </section>
      </div>
    </div>
  ),
};
