import { api, job, page, route, type Spec } from "@wasp.sh/spec";
import { SystemCardCapturePage } from "./SystemCardCapturePage" with { type: "ref" };
import { systemCardCaptureDataApi } from "./capture-api" with { type: "ref" };
import { backfillSystemCards, captureSystemCard } from "./jobs" with { type: "ref" };
import { systemCardProfile } from "./contracts";

export const screenshotsSpec: Spec = [
  route("SystemCardCaptureRoute", systemCardProfile.capturePath, page(SystemCardCapturePage), {
    lazy: false,
  }),
  api("GET", systemCardProfile.dataPath, systemCardCaptureDataApi, {
    entities: ["DesignSystem"],
    auth: false,
  }),
  job(captureSystemCard, {
    executor: "PgBoss",
    entities: ["DesignSystem"],
    performExecutorOptions: {
      pgBoss: { retryLimit: 4, retryDelay: 30, retryBackoff: true, expireInSeconds: 120 },
    },
  }),
  job(backfillSystemCards, {
    executor: "PgBoss",
    entities: ["DesignSystem"],
    schedule: { cron: "*/5 * * * *", args: {} },
  }),
];
