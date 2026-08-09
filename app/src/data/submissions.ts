import type { DesignSystem } from "./catalog";

export type SubmissionStage = "waiting" | "feedback" | "valid" | "published";
export type ValidationStatus = "pass" | "warning" | "fail";

export type ValidationCheck = {
  id: string;
  label: string;
  detail: string;
  pointer?: string;
  status: ValidationStatus;
};

export const passedPublicationChecks: ValidationCheck[] = [
  {
    id: "publication:structure",
    label: "Document structure",
    detail: "Required identity, foundation, component, and accessibility fields are complete.",
    status: "pass",
  },
  {
    id: "publication:contrast",
    label: "Color contrast",
    detail: "Text, actions, and focus indicators meet publication contrast requirements.",
    status: "pass",
  },
  {
    id: "publication:typography",
    label: "Typography and fonts",
    detail: "Font references, files, and typography roles are valid.",
    status: "pass",
  },
  {
    id: "publication:components",
    label: "Components and actions",
    detail: "Component styles, action variants, and action sizes are valid.",
    status: "pass",
  },
  {
    id: "publication:safety",
    label: "Content safety",
    detail: "Text and CSS values passed content safety checks.",
    status: "pass",
  },
  {
    id: "publication:sources",
    label: "Source details",
    detail: "Source links use valid web addresses.",
    status: "pass",
  },
];

export type SubmissionRecord = {
  id: string;
  revision: number;
  system: DesignSystem;
  status: SubmissionStage;
  submittedAt: string;
  updatedAt: Date;
  checks: ValidationCheck[];
  publication: {
    slug: string;
    isEditing: boolean;
    hasDraftChanges: boolean;
  } | null;
};

export type UserProfile = {
  id: string;
  name: string;
  handle: string;
  username?: string;
  avatarUrl: string;
};
