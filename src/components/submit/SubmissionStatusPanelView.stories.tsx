import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { catalogFixtures } from "../../data/catalogFixtures";
import {
  passedPublicationChecks,
  type SubmissionRecord,
  type ValidationCheck,
} from "../../data/submissions";
import { Button } from "../../design-system/components";
import { SubmissionStatusPanelView } from "./SubmissionStatusPanelView";

const feedbackChecks: ValidationCheck[] = [
  {
    id: "foundation:canvas",
    label: "foundation.value.invalid",
    detail: "Canvas must use a six-digit hex color.",
    pointer: "/foundations/colors/canvas",
    status: "fail",
  },
  {
    id: "accessibility:contrast",
    label: "accessibility.contrast.insufficient",
    detail: "Muted text needs more contrast against the canvas.",
    status: "warning",
  },
  {
    id: "identity:name",
    label: "Document structure",
    detail: "The system name is complete.",
    status: "pass",
  },
];

function submission(
  status: SubmissionRecord["status"],
  checks: ValidationCheck[],
): SubmissionRecord {
  return {
    id: `submission-${status}`,
    system: catalogFixtures.find(({ id }) => id === "tactile")!,
    status,
    submittedAt: "2 minutes ago",
    updatedAt: new Date("2026-08-05T10:00:00Z"),
    checks,
  };
}

const meta = {
  title: "Product/Submit/Submission Status",
  component: SubmissionStatusPanelView,
  args: {
    submission: submission("feedback", feedbackChecks),
    onPublish: fn(),
    publishing: false,
    publishError: null,
    rightsConfirmed: false,
    onRightsConfirmedChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-lg p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SubmissionStatusPanelView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Feedback: Story = {};

export const Valid: Story = {
  args: {
    submission: submission("valid", passedPublicationChecks),
    rightsConfirmed: true,
  },
};

export const Published: Story = {
  args: {
    submission: submission("published", passedPublicationChecks),
    publishedActions: <Button>View published system</Button>,
  },
};
