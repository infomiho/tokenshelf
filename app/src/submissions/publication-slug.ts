import { randomBytes } from "node:crypto";

const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "design-system";

export const createPublicationSlug = (name: string, suffix = randomBytes(6).toString("hex")) =>
  `${slugify(name)}-${suffix}`;
