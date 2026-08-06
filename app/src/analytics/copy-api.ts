import express from "express";
import { prisma, type MiddlewareConfigFn } from "wasp/server";
import type { RecordCopy } from "wasp/server/api";
import {
  copyActorHash,
  selectClientAddress,
  trustedProxyMode,
  utcDate,
} from "../infrastructure/security";

export const apiMiddleware: MiddlewareConfigFn = (middleware) => {
  middleware.set("express.json", express.json({ type: "application/json", limit: "32kb" }));
  return middleware;
};

export const recordCopy: RecordCopy<
  Record<string, never>,
  { counted: boolean } | { error: string },
  { slug: string }
> = async (req, res) => {
  const slug = typeof req.body?.slug === "string" ? req.body.slug : "";
  const system = await prisma.designSystem.findFirst({
    where: { slug, lifecycle: "PUBLISHED" },
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
