import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requestCardScreenshot: vi.fn(),
  captureScreenshot: vi.fn(),
}));

vi.mock("./request", () => ({
  requestCardScreenshot: mocks.requestCardScreenshot,
}));

vi.mock("./screenshot-service-client", () => ({
  captureScreenshot: mocks.captureScreenshot,
}));

import { backfillSystemCards, captureSystemCard } from "./jobs";

describe("backfillSystemCards", () => {
  beforeEach(() => {
    process.env.SCREENSHOT_SERVICE_TOKEN = "service-token";
    process.env.SCREENSHOT_CAPTURE_SECRET = "capture-secret";
    mocks.requestCardScreenshot.mockResolvedValue(true);
  });

  afterEach(() => {
    delete process.env.SCREENSHOT_SERVICE_TOKEN;
    delete process.env.SCREENSHOT_CAPTURE_SECRET;
    vi.clearAllMocks();
  });

  it("queries and enqueues a bounded batch of stale published systems", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "missing",
        sourceRevision: 2,
      },
    ]);

    const result = await backfillSystemCards(
      {} as never,
      {
        entities: { DesignSystem: { findMany } },
      } as never,
    );

    expect(findMany).toHaveBeenCalledWith({
      where: {
        lifecycle: "PUBLISHED",
        OR: [
          { cardImageKey: null },
          { cardImageRenderVersion: null },
          { cardImageRenderVersion: { not: "card-v2" } },
          { cardImageCanvas: null },
        ],
      },
      orderBy: { publishedAt: "asc" },
      take: 25,
      select: { id: true, sourceRevision: true },
    });
    expect(mocks.requestCardScreenshot).toHaveBeenCalledWith("missing", 2);
    expect(result).toEqual({ enqueued: 1 });
  });

  it("does nothing when screenshot capture is not configured", async () => {
    delete process.env.SCREENSHOT_SERVICE_TOKEN;
    const findMany = vi.fn();

    const result = await backfillSystemCards(
      {} as never,
      {
        entities: { DesignSystem: { findMany } },
      } as never,
    );

    expect(findMany).not.toHaveBeenCalled();
    expect(result).toEqual({ enqueued: 0 });
  });
});

describe("captureSystemCard", () => {
  beforeEach(() => {
    process.env.SCREENSHOT_CAPTURE_SECRET = "capture-secret";
    process.env.SCREENSHOT_CAPTURE_ORIGIN = "http://capture.example.com";
    mocks.captureScreenshot.mockResolvedValue(undefined);
  });

  afterEach(() => {
    delete process.env.SCREENSHOT_CAPTURE_SECRET;
    delete process.env.SCREENSHOT_CAPTURE_ORIGIN;
    vi.clearAllMocks();
  });

  it("commits metadata only when the captured revision is still current", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const context = {
      entities: {
        DesignSystem: {
          findFirst: vi.fn().mockResolvedValue({
            cardImageKey: null,
            cardImageRenderVersion: null,
            cardImageCanvas: null,
            renderer: { colors: { canvas: "#0a0a0b" } },
          }),
          updateMany,
        },
      },
    };

    await captureSystemCard({ designSystemId: "system-id", sourceRevision: 3 }, context as never);

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "system-id", sourceRevision: 3, lifecycle: "PUBLISHED" },
      data: {
        cardImageKey: "public/systems/system-id/cards/r3/card-v2.webp",
        cardImageRenderVersion: "card-v2",
        cardImageCanvas: "#0a0a0b",
      },
    });
    expect(mocks.captureScreenshot).toHaveBeenCalledWith({
      profile: "card-v2",
      captureUrl: expect.stringMatching(
        /^http:\/\/capture\.example\.com\/internal\/system-card-capture\/\?token=/,
      ),
      objectKey: "public/systems/system-id/cards/r3/card-v2.webp",
    });
  });

  it("does not capture an invalid renderer", async () => {
    const context = {
      entities: {
        DesignSystem: {
          findFirst: vi.fn().mockResolvedValue({
            cardImageKey: null,
            cardImageRenderVersion: null,
            cardImageCanvas: null,
            renderer: { colors: {} },
          }),
        },
      },
    };

    await expect(
      captureSystemCard({ designSystemId: "system-id", sourceRevision: 3 }, context as never),
    ).rejects.toThrow("Renderer canvas is invalid");
    expect(mocks.captureScreenshot).not.toHaveBeenCalled();
  });
});
