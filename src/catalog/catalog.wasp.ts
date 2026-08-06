import { action, api, page, query, route, type Spec } from "@wasp.sh/spec";
import { LandingPage } from "../pages/LandingPage" with { type: "ref" };
import { HotPage } from "../pages/HotPage" with { type: "ref" };
import { NewPage } from "../pages/NewPage" with { type: "ref" };
import { SystemPage } from "../pages/SystemPage" with { type: "ref" };
import { UserProfilePage } from "../pages/UserProfilePage" with { type: "ref" };
import {
  getCatalogHome,
  getSystem,
  getUserProfile,
  getViewerVotes,
  listSystems,
  setVote,
} from "../server/catalog-operations" with { type: "ref" };
import { serveDesignMd } from "../server/design-md-api" with { type: "ref" };

const catalogEntities = ["DesignSystem", "Vote", "DailyCopyMetric", "DailyPick"];

export const catalogSpec: Spec = [
  route("RootRoute", "/", page(LandingPage), { prerender: true, lazy: false }),
  route("HotRoute", "/hot", page(HotPage)),
  route("NewRoute", "/new", page(NewPage)),
  route("SystemRoute", "/systems/:systemId", page(SystemPage)),
  route("UserProfileRoute", "/:profileHandle", page(UserProfilePage)),
  api("GET", "/api/systems/:systemId/DESIGN.md", serveDesignMd, {
    entities: ["DesignSystem"],
    auth: false,
  }),
  query(getCatalogHome, { entities: catalogEntities, auth: false }),
  query(listSystems, { entities: catalogEntities, auth: false }),
  query(getSystem, { entities: catalogEntities, auth: false }),
  query(getUserProfile, { entities: ["User", ...catalogEntities], auth: false }),
  query(getViewerVotes, { entities: ["Vote"] }),
  action(setVote, { entities: ["DesignSystem", "Vote"] }),
];
