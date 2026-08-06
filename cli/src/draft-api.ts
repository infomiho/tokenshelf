import ky, { isHTTPError } from "ky";
import type { DraftApi } from "./run.js";

type ProtocolProblem = {
  code?: string;
  currentRevision?: number;
};

const protocolProblemMessages: Record<string, string> = {
  "if-match-required": "A revision is required.",
  "invalid-if-match": "The revision is invalid.",
  "malformed-request": "The draft document is not valid JSON.",
  "revision-conflict": "Refetch the work and retry.",
  "schema-rejected": "The draft document does not match the schema.",
  "session-expired": "The draft session has expired.",
  "session-not-found": "The draft session was not found.",
  "session-revoked": "The draft session has been revoked.",
  "unsupported-media-type": "The draft document media type is unsupported.",
  "work-not-found": "The draft was not found.",
  "work-rejected": "The draft was rejected.",
};

async function withoutCapabilityInErrors<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (!isHTTPError<ProtocolProblem>(error)) throw new Error("Draft request failed.");
    const problem = typeof error.data === "object" && error.data ? error.data : null;
    if (!problem) throw new Error(`Draft request failed with status ${error.response.status}.`);
    const message = problem.code ? protocolProblemMessages[problem.code] : undefined;
    if (!message) throw new Error(`Draft request failed with status ${error.response.status}.`);
    const revision = Number.isSafeInteger(problem.currentRevision)
      ? ` Current revision: ${problem.currentRevision}.`
      : "";
    throw new Error(`${problem.code}: ${message}${revision}`);
  }
}

export function createDraftApi(sessionUrl: string): DraftApi {
  const client = ky.create({
    prefix: sessionUrl.replace(/\/$/, ""),
    redirect: "error",
    retry: 0,
  });

  return {
    pull() {
      return withoutCapabilityInErrors(
        client.get("work").json<{ revision: number; document: unknown }>(),
      );
    },
    push(document, revision) {
      return withoutCapabilityInErrors(
        client
          .put("work", {
            headers: { "if-match": `"${revision}"` },
            json: document,
          })
          .json(),
      );
    },
  };
}
