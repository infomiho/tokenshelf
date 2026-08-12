import { captureSystemCard as captureSystemCardJob } from "wasp/server/jobs";
import { systemCardRenderVersion } from "./contracts";

export async function requestCardScreenshot(designSystemId: string, sourceRevision: number) {
  if (!process.env.SCREENSHOT_SERVICE_TOKEN || !process.env.SCREENSHOT_CAPTURE_SECRET) return false;
  try {
    await captureSystemCardJob.submit(
      { designSystemId, sourceRevision },
      { singletonKey: `${designSystemId}:${sourceRevision}:${systemCardRenderVersion}` },
    );
    return true;
  } catch (error) {
    console.error("Unable to enqueue system card screenshot.", {
      designSystemId,
      sourceRevision,
      error,
    });
    return false;
  }
}
