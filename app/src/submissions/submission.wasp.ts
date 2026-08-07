import { action, page, query, route, type Spec } from "@wasp.sh/spec";
import { SubmitPage } from "../pages/SubmitPage" with { type: "ref" };
import { SubmissionsPage } from "../pages/SubmissionsPage" with { type: "ref" };
import {
  claimGuestSubmissions,
  createSubmission,
  publishSubmission,
  reopenSubmission,
  rotateAgentCapability,
  withdrawSubmission,
} from "./operations" with { type: "ref" };
import {
  getSubmissionSync,
  getSubmissionWorkspace,
  listMySubmissions,
} from "./queries" with { type: "ref" };

const submissionEntities = [
  "GuestSession",
  "Submission",
  "SubmissionDraft",
  "SubmissionAgentSession",
];

export const submissionSpec: Spec = [
  route("SubmitRoute", "/submit/:submissionId?", page(SubmitPage)),
  route("SubmissionsRoute", "/submissions", page(SubmissionsPage)),
  query(getSubmissionWorkspace, { entities: submissionEntities }),
  query(getSubmissionSync, { entities: submissionEntities }),
  query(listMySubmissions, { entities: [...submissionEntities, "DesignSystem"] }),
  action(createSubmission, { entities: submissionEntities }),
  action(claimGuestSubmissions, { entities: submissionEntities }),
  action(rotateAgentCapability, { entities: submissionEntities }),
  action(reopenSubmission, { entities: [...submissionEntities, "DesignSystem"] }),
  action(withdrawSubmission, { entities: [...submissionEntities, "DesignSystem"] }),
  action(publishSubmission, { entities: [...submissionEntities, "DesignSystem"] }),
];
