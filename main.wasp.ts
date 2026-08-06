import { app, page, route } from "@wasp.sh/spec";
import Root from "./src/Root" with { type: "ref" };
import { userSignupFields } from "./src/auth/github" with { type: "ref" };
import { serverMiddleware } from "./src/server/rate-limits" with { type: "ref" };
import {
  seedDevelopmentCatalog,
  seedProductionCatalog,
} from "./src/server/seed" with { type: "ref" };
import { agentSpec } from "./src/server/agent.wasp";
import { analyticsJobsSpec } from "./src/server/analytics-jobs.wasp";
import { catalogSpec } from "./src/catalog/catalog.wasp";
import { submissionSpec } from "./src/submissions/submission.wasp";
import { NotFoundPage } from "./src/pages/NotFoundPage" with { type: "ref" };

export default app({
  name: "tokenshelf",
  wasp: { version: "^0.25.0" },
  title: "Tokenshelf",
  client: { rootComponent: Root },
  server: { middlewareConfigFn: serverMiddleware },
  db: { seeds: [seedDevelopmentCatalog, seedProductionCatalog] },
  auth: {
    userEntity: "User",
    methods: { gitHub: { userSignupFields } },
    onAuthFailedRedirectTo: "/",
    onAuthSucceededRedirectTo: "/submissions",
  },
  head: [
    "<meta name='viewport' content='width=device-width, initial-scale=1' />",
    "<meta name='description' content='Browse original, source-grounded design systems and copy their tokens and interface guidance for your coding agent.' />",
    "<meta name='theme-color' content='#fbfaf8' />",
    "<meta property='og:title' content='Tokenshelf | Hand-picked design systems for your agent' />",
    "<meta property='og:description' content='Browse original, source-grounded design systems and copy their tokens and interface guidance for your coding agent.' />",
    "<meta property='og:type' content='website' />",
    "<meta property='og:site_name' content='Tokenshelf' />",
    "<meta property='og:locale' content='en_US' />",
    "<meta property='og:image' content='https://tokenshelf.dev/og-image.png' />",
    "<meta property='og:image:type' content='image/png' />",
    "<meta property='og:image:width' content='1200' />",
    "<meta property='og:image:height' content='630' />",
    "<meta property='og:image:alt' content='Tokenshelf logo with the message: Hand-picked design systems for your agent.' />",
    "<meta name='twitter:card' content='summary_large_image' />",
    "<meta name='twitter:title' content='Tokenshelf | Hand-picked design systems for your agent' />",
    "<meta name='twitter:description' content='Browse original, source-grounded design systems and copy their tokens and interface guidance for your coding agent.' />",
    "<meta name='twitter:image' content='https://tokenshelf.dev/og-image.png' />",
    "<meta name='twitter:image:width' content='1200' />",
    "<meta name='twitter:image:height' content='630' />",
    "<meta name='twitter:image:alt' content='Tokenshelf logo with the message: Hand-picked design systems for your agent.' />",
    "<link rel='icon' type='image/svg+xml' href='/favicon.svg' />",
    "<link rel='preload' href='/fonts/satoshi-bold.woff2' as='font' type='font/woff2' crossOrigin='anonymous' />",
    "<link rel='preload' href='/fonts/satoshi-black.woff2' as='font' type='font/woff2' crossOrigin='anonymous' />",
    "<link rel='preconnect' href='https://cdn.jsdelivr.net' crossOrigin='anonymous' />",
  ],
  spec: [
    catalogSpec,
    submissionSpec,
    agentSpec,
    analyticsJobsSpec,
    route("NotFoundRoute", "/*", page(NotFoundPage)),
  ],
});
