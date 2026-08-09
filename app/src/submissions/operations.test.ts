import { beforeEach, describe, expect, it, vi } from "vitest";
import { catalogFixtures } from "../data/catalogFixtures";

const mocks = vi.hoisted(() => ({
  mintCapability: vi.fn(() => ({
    capability: "capability",
    capabilityHash: "capability-hash",
    sessionUrl: "https://example.com/agent/sessions/capability",
    expiresAt: new Date("2026-08-08T00:00:00.000Z"),
  })),
  submissionFindUnique: vi.fn(),
  submissionUpdate: vi.fn(),
  draftUpdate: vi.fn(),
  draftUpdateMany: vi.fn(),
  sessionCreate: vi.fn(),
  designSystemUpdate: vi.fn(),
  designSystemCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@infomiho/agent-work-protocol/server", () => ({
  mintCapability: mocks.mintCapability,
}));

vi.mock("wasp/server", () => {
  class HttpError extends Error {
    constructor(
      public statusCode: number,
      message: string,
      public data?: unknown,
    ) {
      super(message);
    }
  }

  return {
    HttpError,
    prisma: { $transaction: mocks.transaction },
  };
});

import {
  discardSubmissionChanges,
  publishSubmission,
  reopenSubmission,
  withdrawSubmission,
} from "./operations";

const context = { user: { id: "owner-id" } } as Parameters<typeof reopenSubmission>[1];
const transaction = {
  submission: {
    findUnique: mocks.submissionFindUnique,
    update: mocks.submissionUpdate,
  },
  submissionDraft: {
    update: mocks.draftUpdate,
    updateMany: mocks.draftUpdateMany,
  },
  submissionAgentSession: { create: mocks.sessionCreate },
  designSystem: {
    update: mocks.designSystemUpdate,
    create: mocks.designSystemCreate,
  },
};

describe("owned design-system lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation((run) => run(transaction));
  });

  it("reopens an owned publication with a fresh agent capability", async () => {
    const fixture = catalogFixtures[0]!;
    mocks.submissionFindUnique.mockResolvedValue({
      id: "submission-id",
      ownerId: "owner-id",
      lifecycle: "PUBLISHED",
      sessionGeneration: 3,
      draft: { revision: 7 },
      publishedSystem: {
        lifecycle: "PUBLISHED",
        document: fixture.document,
        assessment: { outcome: "pass", diagnostics: [] },
        designMd: fixture.designMd,
        renderer: fixture.renderer,
      },
    });

    const result = await reopenSubmission({ submissionId: "submission-id" }, context);

    expect(mocks.sessionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ submissionId: "submission-id", generation: 4 }),
    });
    expect(mocks.draftUpdate).toHaveBeenCalledWith({
      where: { submissionId: "submission-id" },
      data: expect.objectContaining({
        revision: { increment: 1 },
        document: fixture.document,
        designMd: fixture.designMd,
        renderer: fixture.renderer,
      }),
    });
    expect(mocks.submissionUpdate).toHaveBeenCalledWith({
      where: { id: "submission-id" },
      data: { lifecycle: "OPEN", sessionGeneration: 4 },
    });
    expect(result.sessionUrl).toContain("capability");
  });

  it("discards draft changes while preserving the live publication", async () => {
    const fixture = catalogFixtures[0]!;
    mocks.submissionFindUnique.mockResolvedValue({
      id: "submission-id",
      ownerId: "owner-id",
      lifecycle: "OPEN",
      draft: { revision: 8 },
      publishedSystem: {
        slug: fixture.slug,
        lifecycle: "PUBLISHED",
        document: fixture.document,
        assessment: { outcome: "pass", diagnostics: [] },
        designMd: fixture.designMd,
        renderer: fixture.renderer,
      },
    });
    mocks.draftUpdateMany.mockResolvedValue({ count: 1 });

    const result = await discardSubmissionChanges(
      { submissionId: "submission-id", expectedRevision: 8 },
      context,
    );

    expect(mocks.draftUpdateMany).toHaveBeenCalledWith({
      where: { submissionId: "submission-id", revision: 8 },
      data: expect.objectContaining({
        revision: { increment: 1 },
        document: fixture.document,
      }),
    });
    expect(mocks.submissionUpdate).toHaveBeenCalledWith({
      where: { id: "submission-id" },
      data: { lifecycle: "PUBLISHED", sessionGeneration: { increment: 1 } },
    });
    expect(mocks.designSystemUpdate).not.toHaveBeenCalled();
    expect(result).toEqual({ slug: fixture.slug });
  });

  it("rejects discard when the draft revision changed", async () => {
    mocks.submissionFindUnique.mockResolvedValue({
      id: "submission-id",
      ownerId: "owner-id",
      lifecycle: "OPEN",
      draft: { revision: 9 },
      publishedSystem: { slug: "gridline", lifecycle: "PUBLISHED" },
    });

    await expect(
      discardSubmissionChanges({ submissionId: "submission-id", expectedRevision: 8 }, context),
    ).rejects.toThrow("The draft changed. Review the latest version.");
    expect(mocks.draftUpdateMany).not.toHaveBeenCalled();
    expect(mocks.submissionUpdate).not.toHaveBeenCalled();
  });

  it("rejects discard when the draft changes during the transaction", async () => {
    mocks.submissionFindUnique.mockResolvedValue({
      id: "submission-id",
      ownerId: "owner-id",
      lifecycle: "OPEN",
      draft: { revision: 8 },
      publishedSystem: {
        slug: "gridline",
        lifecycle: "PUBLISHED",
        document: {},
        assessment: {},
        designMd: "",
        renderer: {},
      },
    });
    mocks.draftUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      discardSubmissionChanges({ submissionId: "submission-id", expectedRevision: 8 }, context),
    ).rejects.toThrow("The draft changed. Review the latest version.");
    expect(mocks.submissionUpdate).not.toHaveBeenCalled();
  });

  it("hides foreign publications behind not found", async () => {
    mocks.submissionFindUnique.mockResolvedValue({
      id: "submission-id",
      ownerId: "someone-else",
      lifecycle: "PUBLISHED",
      publishedSystem: { lifecycle: "PUBLISHED" },
    });

    await expect(reopenSubmission({ submissionId: "submission-id" }, context)).rejects.toThrow(
      "Design system not found.",
    );
  });

  it("withdraws the publication and revokes agent access", async () => {
    mocks.submissionFindUnique.mockResolvedValue({
      id: "submission-id",
      ownerId: "owner-id",
      lifecycle: "PUBLISHED",
      publishedSystem: { id: "system-id" },
    });

    await withdrawSubmission({ submissionId: "submission-id" }, context);

    expect(mocks.designSystemUpdate).toHaveBeenCalledWith({
      where: { id: "system-id" },
      data: { lifecycle: "WITHDRAWN", withdrawnAt: expect.any(Date) },
    });
    expect(mocks.submissionUpdate).toHaveBeenCalledWith({
      where: { id: "submission-id" },
      data: { lifecycle: "WITHDRAWN", sessionGeneration: { increment: 1 } },
    });
  });

  it("does not let another owner withdraw the publication", async () => {
    mocks.submissionFindUnique.mockResolvedValue({
      id: "submission-id",
      ownerId: "someone-else",
      lifecycle: "PUBLISHED",
      publishedSystem: { id: "system-id" },
    });

    await expect(withdrawSubmission({ submissionId: "submission-id" }, context)).rejects.toThrow(
      "Design system not found.",
    );
    expect(mocks.designSystemUpdate).not.toHaveBeenCalled();
  });

  it("republishes into the existing catalog record", async () => {
    const fixture = catalogFixtures[0]!;
    mocks.submissionFindUnique.mockResolvedValue({
      id: "submission-id",
      ownerId: "owner-id",
      lifecycle: "OPEN",
      draft: { revision: 7, document: fixture.document },
      publishedSystem: {
        id: "system-id",
        slug: fixture.slug,
        lifecycle: "PUBLISHED",
      },
    });
    mocks.designSystemUpdate.mockResolvedValue({ id: "system-id", slug: fixture.slug });

    const result = await publishSubmission(
      { submissionId: "submission-id", expectedRevision: 7, rightsAttestation: true },
      context,
    );

    expect(mocks.designSystemCreate).not.toHaveBeenCalled();
    expect(mocks.designSystemUpdate).toHaveBeenCalledWith({
      where: { id: "system-id" },
      data: expect.objectContaining({ sourceRevision: 7, name: fixture.document.identity.name }),
    });
    expect(mocks.submissionUpdate).toHaveBeenCalledWith({
      where: { id: "submission-id" },
      data: { lifecycle: "PUBLISHED", sessionGeneration: { increment: 1 } },
    });
    expect(result).toEqual({ id: "system-id", slug: fixture.slug });
  });

  it("returns the existing publication after an acknowledged publish retry", async () => {
    mocks.submissionFindUnique.mockResolvedValue({
      id: "submission-id",
      ownerId: "owner-id",
      lifecycle: "PUBLISHED",
      publishedSystem: {
        id: "system-id",
        slug: "gridline",
        sourceRevision: 7,
      },
    });

    const result = await publishSubmission(
      { submissionId: "submission-id", expectedRevision: 7, rightsAttestation: true },
      context,
    );

    expect(result).toEqual({ id: "system-id", slug: "gridline" });
    expect(mocks.designSystemUpdate).not.toHaveBeenCalled();
    expect(mocks.submissionUpdate).not.toHaveBeenCalled();
  });

  it("rejects a publish retry for a different revision", async () => {
    mocks.submissionFindUnique.mockResolvedValue({
      id: "submission-id",
      ownerId: "owner-id",
      lifecycle: "PUBLISHED",
      publishedSystem: {
        id: "system-id",
        slug: "gridline",
        sourceRevision: 8,
      },
    });

    await expect(
      publishSubmission(
        { submissionId: "submission-id", expectedRevision: 7, rightsAttestation: true },
        context,
      ),
    ).rejects.toThrow("The draft changed. Review the latest version.");
  });
});
