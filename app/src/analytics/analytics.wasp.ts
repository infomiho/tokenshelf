import { api, apiNamespace, job, type Spec } from "@wasp.sh/spec";
import { apiMiddleware, recordCopy } from "./copy-api" with { type: "ref" };
import {
  cleanupGuestSubmissions,
  finalizeDailyPick,
  pruneCopyReceipts,
} from "./jobs" with { type: "ref" };

export const analyticsJobsSpec: Spec = [
  apiNamespace("/api", { middlewareConfigFn: apiMiddleware }),
  api("POST", "/api/systems/copy", recordCopy, {
    entities: ["DesignSystem", "CopyReceipt", "DailyCopyMetric"],
    auth: false,
  }),
  job(finalizeDailyPick, {
    executor: "PgBoss",
    entities: ["DesignSystem", "Vote", "DailyPick"],
    schedule: { cron: "5 0 * * *", args: {} },
  }),
  job(cleanupGuestSubmissions, {
    executor: "PgBoss",
    entities: ["GuestSession", "Submission", "SubmissionDraft", "SubmissionAgentSession"],
    schedule: { cron: "0 * * * *", args: {} },
  }),
  job(pruneCopyReceipts, {
    executor: "PgBoss",
    entities: ["CopyReceipt"],
    schedule: { cron: "15 0 * * *", args: {} },
  }),
];
