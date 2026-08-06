import { action, api, page, query, route, type Spec } from "@wasp.sh/spec";
import { LandingPage } from "../pages/LandingPage" with { type: "ref" };
import { HotPage } from "../pages/HotPage" with { type: "ref" };
import { NewPage } from "../pages/NewPage" with { type: "ref" };
import { SystemPage } from "../pages/SystemPage" with { type: "ref" };
import { UserProfilePage } from "../pages/UserProfilePage" with { type: "ref" };
import {
  getCatalogHome,
  getSystem,
  getTagSuggestions,
  getUserProfile,
  getViewerVotes,
  listSystems,
  setVote,
} from "./operations" with { type: "ref" };
import {
  searchSystemsApi,
  serveDesignDocumentApi,
  serveDesignMdApi,
  serveDesignSystemSchemaApi,
} from "./api-handlers" with { type: "ref" };

const catalogEntities = ["DesignSystem", "Vote", "DailyCopyMetric", "DailyPick"];
const apiPrefix = "/v1";
const designSystemDocumentVersion = "1";

export const catalogSpec: Spec = [
  route("RootRoute", "/", page(LandingPage), { prerender: true, lazy: false }),
  route("HotRoute", "/hot", page(HotPage)),
  route("NewRoute", "/new", page(NewPage)),
  route("SystemRoute", "/systems/:slug", page(SystemPage)),
  route("UserProfileRoute", "/:profileHandle", page(UserProfilePage)),
  api("GET", `${apiPrefix}/systems`, searchSystemsApi, {
    entities: catalogEntities,
    auth: false,
  }),
  api("GET", `${apiPrefix}/systems/:slug/DESIGN.md`, serveDesignMdApi, {
    entities: ["DesignSystem"],
    auth: false,
  }),
  api("GET", `${apiPrefix}/systems/:slug/document.json`, serveDesignDocumentApi, {
    entities: ["DesignSystem"],
    auth: false,
  }),
  api(
    "GET",
    `${apiPrefix}/schemas/design-system-document/${designSystemDocumentVersion}`,
    serveDesignSystemSchemaApi,
    {
      auth: false,
    },
  ),
  query(getCatalogHome, { entities: catalogEntities, auth: false }),
  query(getTagSuggestions, { entities: ["DesignSystem"], auth: false }),
  query(listSystems, { entities: catalogEntities, auth: false }),
  query(getSystem, { entities: catalogEntities, auth: false }),
  query(getUserProfile, { entities: ["User", ...catalogEntities], auth: false }),
  query(getViewerVotes, { entities: ["Vote"] }),
  action(setVote, { entities: ["DesignSystem", "Vote"] }),
];
