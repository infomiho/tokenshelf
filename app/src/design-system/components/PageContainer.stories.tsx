import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageContainer } from "./PageContainer";

const meta = {
  title: "Components/PageContainer",
  component: PageContainer,
  parameters: { layout: "fullscreen" },
  argTypes: {
    width: { control: "inline-radio", options: ["page", "content", "prose"] },
  },
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { width: "content" },
  render: (args) => (
    <PageContainer {...args} className="py-8">
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
        <p className="eyebrow">Responsive container</p>
        <h1 className="section-title mt-3">Content stays aligned to the page grid.</h1>
      </div>
    </PageContainer>
  ),
};

export const Widths: Story = {
  render: () => (
    <div className="grid gap-7 py-8">
      {(["page", "content", "prose"] as const).map((width) => (
        <PageContainer key={width} width={width}>
          <div className="rounded-[var(--radius-control)] bg-brand-soft p-4">
            <strong className="capitalize">{width}</strong>
            <code className="ml-3 text-xs text-muted">
              {width === "page"
                ? "--layout-max"
                : width === "content"
                  ? "--layout-content-max"
                  : "--layout-prose-max"}
            </code>
          </div>
        </PageContainer>
      ))}
    </div>
  ),
};

export const NarrowViewport: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <PageContainer className="py-6">
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <h2 className="card-title">Mobile gutter</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          The responsive gutter preserves readable space at narrow widths.
        </p>
      </div>
    </PageContainer>
  ),
};
