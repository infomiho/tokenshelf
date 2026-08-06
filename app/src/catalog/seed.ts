import type { DbSeedFn, PrismaClient } from "wasp/server";
import { catalogFixtures } from "../data/catalogFixtures";
import { designSystemModel } from "../domain/design-system/model";
import { validateDesignSystemDocument } from "../domain/design-system/validation";
import { utcDate } from "../infrastructure/security";

async function seedCatalogSystems(prisma: PrismaClient) {
  const owner = await prisma.user.upsert({
    where: { id: "tokenshelf-fixture-owner" },
    create: {
      id: "tokenshelf-fixture-owner",
      displayName: "Tokenshelf",
    },
    update: { displayName: "Tokenshelf", githubHandle: null },
  });
  const today = utcDate();
  const systems: { id: string }[] = [];

  for (const [index, fixture] of catalogFixtures.entries()) {
    const sourceSubmissionId = `fixture-submission-${fixture.fixtureId}`;
    const validation = await validateDesignSystemDocument(fixture.document);
    if (validation.kind === "structural-failure")
      throw new Error(
        `Invalid catalog fixture ${fixture.fixtureId}: ${JSON.stringify(validation.issues)}`,
      );
    const { document, assessment } = validation;
    if (
      !assessment.artifacts ||
      assessment.diagnostics.some(({ severity }) => severity === "error")
    )
      throw new Error(
        `Invalid catalog fixture ${fixture.fixtureId}: ${JSON.stringify(assessment.diagnostics)}`,
      );
    const { designMd, renderer } = assessment.artifacts;
    await prisma.submission.upsert({
      where: { id: sourceSubmissionId },
      create: {
        id: sourceSubmissionId,
        ownerId: owner.id,
        lifecycle: "PUBLISHED",
        draft: {
          create: {
            revision: 1,
            document,
            assessment: { outcome: "pass", diagnostics: assessment.diagnostics },
            designMd,
            renderer,
            updatedBy: "seed",
          },
        },
      },
      update: {
        ownerId: owner.id,
        lifecycle: "PUBLISHED",
        draft: {
          upsert: {
            create: {
              revision: 1,
              document,
              assessment: { outcome: "pass", diagnostics: assessment.diagnostics },
              designMd,
              renderer,
              updatedBy: "seed",
            },
            update: {
              document,
              assessment: { outcome: "pass", diagnostics: assessment.diagnostics },
              designMd,
              renderer,
              updatedBy: "seed",
            },
          },
        },
      },
    });
    const system = await prisma.designSystem.upsert({
      where: { sourceSubmissionId },
      create: {
        slug: fixture.slug,
        ownerId: owner.id,
        name: document.identity.name,
        summary: document.identity.summary,
        tags: document.identity.tags,
        inspiration: fixture.inspiration,
        document,
        designMd,
        renderer,
        assessment: { outcome: "pass", diagnostics: assessment.diagnostics },
        validatorVersion: `${designSystemModel.id}@${designSystemModel.version}`,
        sourceSubmissionId,
        sourceRevision: 1,
        rightsAttestation: true,
        rightsStatementVersion: "fixture-v1",
        rightsAcceptedAt: new Date(
          today.getTime() - (catalogFixtures.length - index) * 24 * 60 * 60 * 1_000,
        ),
        publishedAt: new Date(
          today.getTime() - (catalogFixtures.length - index) * 24 * 60 * 60 * 1_000,
        ),
      },
      update: {
        slug: fixture.slug,
        ownerId: owner.id,
        name: document.identity.name,
        summary: document.identity.summary,
        tags: document.identity.tags,
        inspiration: fixture.inspiration,
        document,
        designMd,
        renderer,
        assessment: { outcome: "pass", diagnostics: assessment.diagnostics },
        validatorVersion: `${designSystemModel.id}@${designSystemModel.version}`,
      },
    });
    systems.push(system);
  }

  return { systems, today };
}

export const seedProductionCatalog: DbSeedFn = async (prisma) => {
  await seedCatalogSystems(prisma);
};

export const seedDevelopmentCatalog: DbSeedFn = async (prisma) => {
  const { systems, today } = await seedCatalogSystems(prisma);
  const fixturePicks = systems.slice(0, 4).map((system, index) => {
    const featuredDate = new Date(today.getTime() - index * 24 * 60 * 60 * 1_000);
    return prisma.dailyPick.create({
      data: {
        featuredDate,
        competitionDate: new Date(featuredDate.getTime() - 24 * 60 * 60 * 1_000),
        winnerId: system.id,
        voteSnapshot: 0,
        ruleVersion: "fixture-v1",
      },
    });
  });

  await prisma.$transaction([
    prisma.dailyPick.deleteMany({ where: { ruleVersion: "fixture-v1" } }),
    ...fixturePicks,
  ]);
};
