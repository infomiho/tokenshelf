import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { expect, fn, waitFor } from "storybook/test";
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
    revision: 3,
    system: catalogFixtures.find(({ fixtureId }) => fixtureId === "tactile")!,
    status,
    submittedAt: "2 minutes ago",
    updatedAt: new Date("2026-08-05T10:00:00Z"),
    checks,
    publication: null,
  };
}

const meta = {
  title: "Product/Submit/Submission Status",
  component: SubmissionStatusPanelView,
  args: {
    submission: submission("feedback", feedbackChecks),
    onPublish: fn(),
    publishing: false,
    reviewingDraft: false,
    publishConflict: false,
    publicationOutcome: null,
    onReviewLatestDraft: fn(async () => true),
    onDiscardChanges: fn(),
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
    publishedActions: <Button className="w-full">View published system</Button>,
  },
};

export const EditingPublishedSystem: Story = {
  args: {
    submission: {
      ...submission("valid", passedPublicationChecks),
      publication: { slug: "tactile", isEditing: true, hasDraftChanges: true },
    },
    rightsConfirmed: true,
  },
};

export const EditingWithFixesNeeded: Story = {
  args: {
    submission: {
      ...submission("feedback", feedbackChecks),
      publication: { slug: "tactile", isEditing: true, hasDraftChanges: true },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Discard changes" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Publish changes" })).not.toBeInTheDocument();
  },
};

export const PublishConflict: Story = {
  args: {
    submission: {
      ...submission("valid", passedPublicationChecks),
      publication: { slug: "tactile", isEditing: true, hasDraftChanges: true },
    },
    publishConflict: true,
  },
};

export const FocusTransitions: Story = {
  render: (args) => <FocusTransitionHarness {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Simulate conflict" }));
    await waitFor(() => expect(canvas.getByRole("alert")).toHaveFocus());

    await userEvent.click(canvas.getByRole("button", { name: "Review latest draft" }));
    await waitFor(() =>
      expect(canvas.getByRole("heading", { name: "Ready to publish changes" })).toHaveFocus(),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Publish changes" }));
    await waitFor(() =>
      expect(canvas.getByRole("heading", { name: "Changes published" })).toHaveFocus(),
    );
  },
};

function FocusTransitionHarness(args: ComponentProps<typeof SubmissionStatusPanelView>) {
  const [publishConflict, setPublishConflict] = useState(false);
  const [revision, setRevision] = useState(args.submission.revision);
  const [published, setPublished] = useState(false);
  const editingSubmission = {
    ...args.submission,
    revision,
    status: "valid" as const,
    publication: { slug: "tactile", isEditing: true, hasDraftChanges: true },
  };

  return (
    <>
      <Button className="mb-4" onClick={() => setPublishConflict(true)}>
        Simulate conflict
      </Button>
      <SubmissionStatusPanelView
        {...args}
        submission={editingSubmission}
        publishConflict={publishConflict}
        publicationOutcome={published ? { kind: "updated", slug: "tactile", revision } : null}
        rightsConfirmed
        onPublish={() => setPublished(true)}
        onReviewLatestDraft={async () => {
          setRevision((current) => current + 1);
          setPublishConflict(false);
          return true;
        }}
      />
    </>
  );
}
