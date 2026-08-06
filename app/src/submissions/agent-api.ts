import { assessed, createAgentWorkProtocol } from "@infomiho/agent-work-protocol/server";
import { createExpressHandlers } from "@infomiho/agent-work-protocol/adapters/express";
import express from "express";
import type { RequestHandler } from "express";
import type { MiddlewareConfigFn } from "wasp/server";
import type { AgentDocs, AgentSession, AgentWork } from "wasp/server/api";
import { designSystemModel } from "../domain/design-system/model";
import { submissionRevisionStore, submissionSessionStore } from "./submission-intake";

const fontGuidance = `For Fontsource fonts:
- Query https://api.fontsource.org/v1/fonts/{id}, /v1/variable/{id}, and /v1/version/{id}; do not guess metadata.
- Include the Fontsource id, family, exact packageVersion, fallback, and each required WOFF2 face.
- Each face needs an exact-version https://cdn.jsdelivr.net/fontsource/fonts/ URL, style, weight or range, and optional stretch.
- Omit unicodeRange for ordinary single-subset faces. Use it only when multiple script or subset faces rely on browser range selection.
- Roles reference local font keys and may set non-wght variable axes.
- Never use @latest, version ranges, arbitrary hosts, remote CSS, or guessed descriptors.`;

const protocol = createAgentWorkProtocol({
  model: designSystemModel,
  sessions: submissionSessionStore,
  revisions: submissionRevisionStore,
  policy: assessed,
  serverUrl: (process.env.WASP_SERVER_URL ?? "http://localhost:3001").replace(/\/$/, ""),
  productName: "Tokenshelf",
  previewUrl: (capability) =>
    `${(process.env.WASP_WEB_CLIENT_URL ?? "http://localhost:3000").replace(/\/$/, "")}/agent-preview/${encodeURIComponent(capability)}`,
  authoringGuidance: `Resolve every diagnostic error before completion.\n\n${fontGuidance}`,
});

const agentHandlers = createExpressHandlers(protocol);

export const agentMiddleware: MiddlewareConfigFn = (middleware) => {
  middleware.delete("logger");
  middleware.set(
    "express.json",
    express.json({ type: ["application/json", "application/json-patch+json"], limit: "256kb" }),
  );
  return middleware;
};

const runExpressHandler = (
  handler: RequestHandler,
  req: Parameters<RequestHandler>[0],
  res: Parameters<RequestHandler>[1],
) =>
  new Promise<void>((resolve, reject) => {
    res.once("finish", resolve);
    res.once("close", resolve);
    handler(req, res, reject);
  });

export const agentSession: AgentSession = (req, res) =>
  runExpressHandler(agentHandlers.session, req, res);
export const agentWork: AgentWork = (req, res) => runExpressHandler(agentHandlers.work, req, res);
export const agentDocs: AgentDocs = (req, res) => runExpressHandler(agentHandlers.docs, req, res);
