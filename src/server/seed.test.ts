import { describe, expect, it, vi } from "vitest";
import { catalogFixtures } from "../data/catalogFixtures";
import { seedDevelopmentCatalog, seedProductionCatalog } from "./seed";

function createPrismaMock() {
  return {
    $transaction: vi.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
    user: {
      upsert: vi.fn().mockResolvedValue({ id: "tokenshelf-fixture-owner" }),
    },
    submission: {
      upsert: vi.fn().mockResolvedValue({}),
    },
    designSystem: {
      upsert: vi.fn(({ create: { slug } }) => Promise.resolve({ id: slug })),
    },
    dailyPick: {
      create: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  };
}

describe("catalog seeds", () => {
  it("seeds the shared Tokenshelf systems without fabricated production picks", async () => {
    const prisma = createPrismaMock();

    await seedProductionCatalog(prisma as never);

    expect(prisma.user.upsert).toHaveBeenCalledOnce();
    expect(prisma.submission.upsert).toHaveBeenCalledTimes(catalogFixtures.length);
    expect(prisma.designSystem.upsert).toHaveBeenCalledTimes(catalogFixtures.length);
    expect(prisma.designSystem.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sourceSubmissionId: `fixture-submission-${catalogFixtures[0].id}` },
      }),
    );
    expect(prisma.dailyPick.deleteMany).not.toHaveBeenCalled();
    expect(prisma.dailyPick.create).not.toHaveBeenCalled();
  });

  it("adds demo picks only in the development seed", async () => {
    const prisma = createPrismaMock();

    await seedDevelopmentCatalog(prisma as never);

    expect(prisma.designSystem.upsert).toHaveBeenCalledTimes(catalogFixtures.length);
    expect(prisma.dailyPick.deleteMany).toHaveBeenCalledWith({
      where: { ruleVersion: "fixture-v1" },
    });
    expect(prisma.dailyPick.create).toHaveBeenCalledTimes(4);
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });
});
