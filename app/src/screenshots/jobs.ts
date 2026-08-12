import type { BackfillSystemCards, CaptureSystemCard } from "wasp/server/jobs";
import { createCaptureToken } from "./capture-token";
import { captureScreenshot } from "./screenshot-service-client";
import { systemCardProfile, systemCardRenderVersion } from "./contracts";
import { requestCardScreenshot } from "./request";
import {
  cardImageCommit,
  cardImageSelection,
  isCurrentCardImage,
  rendererCanvas,
  staleCardImageWhere,
} from "./card-image";

type CaptureSystemCardInput = {
  designSystemId: string;
  sourceRevision: number;
};

const backfillBatchSize = 25;

function clientUrl() {
  return (
    process.env.SCREENSHOT_CAPTURE_ORIGIN ??
    process.env.WASP_WEB_CLIENT_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function objectKey(designSystemId: string, sourceRevision: number) {
  return `public/systems/${designSystemId}/cards/r${sourceRevision}/${systemCardProfile.id}.webp`;
}

export const captureSystemCard: CaptureSystemCard<CaptureSystemCardInput, void> = async (
  input,
  context,
) => {
  const system = await context.entities.DesignSystem.findFirst({
    where: {
      id: input.designSystemId,
      sourceRevision: input.sourceRevision,
      lifecycle: "PUBLISHED",
    },
    select: {
      ...cardImageSelection,
      renderer: true,
    },
  });
  if (!system) return;
  if (isCurrentCardImage(system)) return;
  const canvas = rendererCanvas(system.renderer);

  const token = createCaptureToken(input.designSystemId, input.sourceRevision);
  const key = objectKey(input.designSystemId, input.sourceRevision);
  await captureScreenshot({
    profile: systemCardProfile.id,
    captureUrl: `${clientUrl()}${systemCardProfile.capturePath}?token=${encodeURIComponent(token)}`,
    objectKey: key,
  });

  await context.entities.DesignSystem.updateMany({
    where: {
      id: input.designSystemId,
      sourceRevision: input.sourceRevision,
      lifecycle: "PUBLISHED",
    },
    data: cardImageCommit(key, canvas),
  });
};

export const backfillSystemCards: BackfillSystemCards<
  Record<string, never>,
  { enqueued: number }
> = async (_input, context) => {
  if (!process.env.SCREENSHOT_SERVICE_TOKEN || !process.env.SCREENSHOT_CAPTURE_SECRET)
    return { enqueued: 0 };

  const systems = await context.entities.DesignSystem.findMany({
    where: {
      lifecycle: "PUBLISHED",
      ...staleCardImageWhere,
    },
    orderBy: { publishedAt: "asc" },
    take: backfillBatchSize,
    select: {
      id: true,
      sourceRevision: true,
    },
  });
  const submissions = await Promise.all(
    systems.map(({ id, sourceRevision }) => requestCardScreenshot(id, sourceRevision)),
  );

  return { enqueued: submissions.filter(Boolean).length };
};
