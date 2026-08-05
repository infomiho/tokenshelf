import type { ValidationCheck, ValidationStatus } from "../data/submissions";

export type ValidationCheckGroup = {
  id: string;
  label: string;
  status: ValidationStatus;
  checks: ValidationCheck[];
};

const checkLabels: Record<string, string> = {
  "accessibility.contrast.insufficient": "Improve text contrast",
  "accessibility.focus-contrast.insufficient": "Improve focus contrast",
  "accessibility.guidance.required": "Add accessibility guidance",
  "components.guidance.required": "Add component guidance",
  "content.unsafe": "Remove unsafe content",
  "content.prompt-injection": "Remove agent instructions",
  "font.reference.invalid": "Fix font setup",
  "foundation.role.missing": "Complete required values",
  "foundation.value.invalid": "Choose a supported value",
  "identity.name.required": "Add a system name",
  "identity.summary.required": "Add a system summary",
  "principles.required": "Add design principles",
  "provenance.source.recommended": "Add source attribution",
};

export function groupValidationChecks(checks: ValidationCheck[]): ValidationCheckGroup[] {
  const groups = new Map<string, ValidationCheckGroup>();
  checks.forEach((check) => {
    const label = validationCheckTitle(check);
    const id = `${check.status}:${label}`;
    const group = groups.get(id);
    if (group) group.checks.push(check);
    else
      groups.set(id, {
        id,
        label,
        status: check.status,
        checks: [check],
      });
  });
  return [...groups.values()];
}

function validationCheckTitle(check: ValidationCheck) {
  if (check.label === "font.reference.invalid") {
    if (check.pointer?.endsWith("/id")) return "Add Fontsource ID";
    if (check.pointer?.endsWith("/packageVersion")) return "Add exact font version";
    if (/\/faces\/\d+\/url$/.test(check.pointer ?? "")) return "Fix Fontsource URLs";
    if (/not supported by any declared face/i.test(check.detail)) return "Add a matching font face";
    if (/default font must reference a declared font/i.test(check.detail))
      return "Choose a declared default font";
    if (/references an undeclared font/i.test(check.detail)) return "Choose a declared font";
    if (/font key .* duplicated/i.test(check.detail)) return "Use unique font keys";
    if (/font keys must be lowercase slugs/i.test(check.detail)) return "Use a lowercase font key";
    if (/font family names/i.test(check.detail)) return "Fix the font family name";
    if (/at least one WOFF2 face/i.test(check.detail)) return "Add a WOFF2 font face";
    if (/system fonts cannot include remote faces/i.test(check.detail))
      return "Remove remote system font faces";
    if (/font weight/i.test(check.detail)) return "Fix the font weight";
    if (/font stretch/i.test(check.detail)) return "Fix the font stretch";
    if (/font axes|wght axis/i.test(check.detail)) return "Fix the font axis";
    if (/unicode range/i.test(check.detail)) return "Fix the Unicode range";
  }
  if (["foundation.value.invalid", "foundation.role.missing"].includes(check.label)) {
    const location = formatValidationLocation(check.pointer);
    if (location)
      return `${check.label === "foundation.role.missing" ? "Add" : "Fix"} ${lowerFirst(location)}`;
  }
  return checkLabels[check.label] ?? sentenceCase(check.label);
}

export function formatValidationLocation(pointer?: string) {
  if (!pointer || pointer === "/") return null;
  const parts = pointer.split("/").filter(Boolean);
  const [section, group, role, child, property] = parts;
  if (section === "foundations") {
    if (group === "colors" && role) return `${title(role)} color`;
    if (group === "spacing" && role) return `${title(role)} spacing`;
    if (group === "radii" && role) return `${title(role)} radius`;
    if (group === "elevation" && role) return `${title(role)} elevation`;
    if (group === "controlHeight") return "Control height";
    if (group === "typography" && role === "roles" && child) return `${title(child)} typography`;
    if (group === "typography" && role === "defaultFont") return "Default font";
    if (group === "typography" && role === "fonts" && child) {
      const font = `Font ${Number(child) + 1}`;
      if (property === "faces" && parts[5])
        return `${font} · Face ${Number(parts[5]) + 1} ${title(parts[6] ?? "")}`.trim();
      return parts[4] ? `${font} ${title(parts[4])}` : font;
    }
  }
  if (section === "components") {
    if (group === "styles" && role) return title(role);
    if (group === "actions" && role === "variants" && child)
      return `Action ${Number(child) + 1}${property ? ` · ${title(property)}` : ""}`;
    if (group === "actions" && role === "sizes" && child)
      return `Action size ${Number(child) + 1}${property ? ` · ${title(property)}` : ""}`;
    if (group === "guidance") return "Component guidance";
  }
  if (section === "accessibility") return "Accessibility guidance";
  if (section === "identity" && group) return `System ${title(group)}`;
  if (section === "principles") return "Design principles";
  if (section === "provenance") return "Source attribution";
  return parts.map(title).join(" · ");
}

export function formatValidationMessage(check: ValidationCheck) {
  if (check.label === "font.reference.invalid") {
    if (check.pointer?.endsWith("/id")) return "Identify the matching Fontsource family.";
    if (check.pointer?.endsWith("/packageVersion"))
      return "Choose the exact Fontsource package version.";
    if (/\/faces\/\d+\/url$/.test(check.pointer ?? ""))
      return "Use files from the selected Fontsource package and version.";
    if (/not supported by any declared face/i.test(check.detail))
      return "Include a face that supports every typography role.";
  }
  if (check.label !== "foundation.value.invalid") return check.detail;
  if (check.pointer?.startsWith("/foundations/radii/")) return "Use a radius from 0 to 256 px.";
  if (check.pointer?.startsWith("/foundations/spacing/"))
    return "Use a spacing value from 0 to 256 px.";
  if (check.pointer === "/foundations/controlHeight")
    return "Use a control height from 0 to 256 px.";
  if (check.pointer?.startsWith("/foundations/colors/")) return "Use a six-digit hex color.";
  if (check.pointer?.startsWith("/foundations/elevation/"))
    return 'Use a valid CSS box-shadow value or "none".';
  return "Use a supported value.";
}

function sentenceCase(value: string) {
  const words = value.replaceAll(".", " ").replaceAll("-", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function title(value: string) {
  if (["css", "id", "url"].includes(value.toLowerCase())) return value.toUpperCase();
  const words = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("-", " ")
    .replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
