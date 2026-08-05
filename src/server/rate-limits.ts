import { createHash } from "node:crypto";
import type { Request, RequestHandler } from "express";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import helmet from "helmet";
import type { MiddlewareConfigFn } from "wasp/server";
import { selectClientAddress, trustedProxyMode } from "./security";

const submissionLimiter = new RateLimiterMemory({ points: 12, duration: 60 });
const capabilityLimiter = new RateLimiterMemory({ points: 240, duration: 60 });
const analyticsLimiter = new RateLimiterMemory({ points: 60, duration: 60 });

const operationPaths = new Set([
  "/operations/create-submission",
  "/operations/rotate-agent-capability",
]);

const requestPath = (req: Request) =>
  req.originalUrl.split("?", 1)[0].toLowerCase().replace(/\/+$/, "");

const requestKey = (req: Request) =>
  createHash("sha256")
    .update(
      selectClientAddress(
        {
          socketAddress: req.socket.remoteAddress,
          forwardedFor: req.get("x-forwarded-for"),
          cloudflareAddress: req.get("cf-connecting-ip"),
        },
        trustedProxyMode(),
      ),
    )
    .digest("hex");

const boundedAnonymousRequests: RequestHandler = (req, res, next) => {
  const path = requestPath(req);
  const limiter = operationPaths.has(path)
    ? submissionLimiter
    : path.startsWith("/agent/")
      ? capabilityLimiter
      : path === "/api/systems/copy"
        ? analyticsLimiter
        : null;
  if (!limiter) return next();
  limiter
    .consume(requestKey(req))
    .then(() => next())
    .catch((error: unknown) => {
      if (!(error instanceof RateLimiterRes)) return next(error);
      res.set("Retry-After", String(Math.ceil(error.msBeforeNext / 1_000)));
      res.status(429).json({ message: "Too many requests. Try again shortly." });
    });
};

export const serverMiddleware: MiddlewareConfigFn = (middleware) => {
  middleware.set(
    "helmet",
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          imgSrc: ["'self'", "data:", "https://avatars.githubusercontent.com"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );
  middleware.set("rateLimit.anonymous", boundedAnonymousRequests);
  return middleware;
};
