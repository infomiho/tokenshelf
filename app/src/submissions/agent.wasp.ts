import { api, apiNamespace, page, query, route, type Spec } from "@wasp.sh/spec";
import { AgentPreviewPage } from "../pages/AgentPreviewPage" with { type: "ref" };
import {
  agentDocs,
  agentMiddleware,
  agentSession,
  agentWork,
} from "./agent-api" with { type: "ref" };
import { getCapabilityPreview } from "./queries" with { type: "ref" };

const submissionEntities = [
  "GuestSession",
  "Submission",
  "SubmissionDraft",
  "SubmissionAgentSession",
];

export const agentSpec: Spec = [
  route("AgentPreviewRoute", "/agent-preview/:capability", page(AgentPreviewPage)),
  query(getCapabilityPreview, { entities: submissionEntities, auth: false }),
  apiNamespace("/agent", { middlewareConfigFn: agentMiddleware }),
  api("GET", "/agent/sessions/:capability", agentSession, {
    entities: submissionEntities,
    auth: false,
  }),
  api("ALL", "/agent/sessions/:capability/work", agentWork, {
    entities: submissionEntities,
    auth: false,
  }),
  api("GET", "/agent/docs/:model/:version/:document", agentDocs, { auth: false }),
];
