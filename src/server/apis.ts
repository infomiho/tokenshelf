import { assessed, createAgentWorkProtocol } from "@infomiho/agent-work-protocol/server";
import { createExpressHandlers } from "@infomiho/agent-work-protocol/adapters/express";
import express from "express";
import type { RequestHandler } from "express";
import { prisma, type MiddlewareConfigFn } from "wasp/server";
import type { AgentDocs, AgentSession, AgentWork, RecordCopy } from "wasp/server/api";
import { designSystemModel } from "../data/design-document";
import { copyActorHash, selectClientAddress, trustedProxyMode, utcDate } from "./security";
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

export const apiMiddleware: MiddlewareConfigFn = (middleware) => {
  middleware.set("express.json", express.json({ type: "application/json", limit: "32kb" }));
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

export const recordCopy: RecordCopy<
  Record<string, never>,
  { counted: boolean } | { error: string },
  { systemId: string }
> = async (req, res) => {
  const systemId = typeof req.body?.systemId === "string" ? req.body.systemId : "";
  const system = await prisma.designSystem.findFirst({
    where: { OR: [{ id: systemId }, { slug: systemId }], lifecycle: "PUBLISHED" },
    select: { id: true },
  });
  if (!system) {
    res.status(404).json({ error: "Design system not found." });
    return;
  }
  const secret = process.env.COPY_ANALYTICS_SECRET;
  if (!secret) {
    res.status(503).json({ error: "Copy analytics is not configured." });
    return;
  }
  const date = utcDate();
  const address = selectClientAddress(
    {
      socketAddress: req.socket.remoteAddress,
      forwardedFor: req.get("x-forwarded-for"),
      cloudflareAddress: req.get("cf-connecting-ip"),
    },
    trustedProxyMode(),
  );
  const actorHash = copyActorHash(secret, date, address);
  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.copyReceipt.create({
        data: { designSystemId: system.id, receiptDate: date, actorHash },
      });
      await transaction.dailyCopyMetric.upsert({
        where: { designSystemId_metricDate: { designSystemId: system.id, metricDate: date } },
        create: { designSystemId: system.id, metricDate: date, count: 1 },
        update: { count: { increment: 1 } },
      });
    });
    res.status(201).json({ counted: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      res.status(200).json({ counted: false });
      return;
    }
    throw error;
  }
};
