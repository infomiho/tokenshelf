import {
  useId,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import {
  colorRoles,
  componentStyleRoles,
  elevationRoles,
  radiusRoles,
  spaceRoles,
  typographyRoles,
  type ActionsDocument,
} from "../domain/design-system";
import type { PreviewRenderer } from "../data/catalog";
import type { SystemPreviewProjection } from "./SystemPreview";

type RendererStyle = CSSProperties & Record<`--preview-${string}`, string>;

export function SystemComponentSpecimen({
  renderer,
  projection,
  decorative = false,
}: {
  renderer: PreviewRenderer;
  projection: SystemPreviewProjection;
  decorative?: boolean;
}) {
  return (
    <section
      className="renderer-board"
      data-renderer-root="system"
      data-projection={projection}
      data-field-treatment={renderer.treatments.field}
      data-tabs-treatment={renderer.treatments.tabs}
      style={createRendererStyle(renderer)}
      aria-label={`${renderer.name} ${projection} preview`}
      aria-hidden={decorative || undefined}
    >
      <ComponentGallery renderer={renderer} />
    </section>
  );
}

function ComponentGallery({ renderer }: { renderer: PreviewRenderer }) {
  const instanceId = useId();
  const [activeNavbarItem, setActiveNavbarItem] = useState("Projects");
  const [activeView, setActiveView] = useState("Overview");

  return (
    <div className="component-gallery">
      <PreviewNavbar
        name={renderer.name}
        actions={renderer.actions}
        activeItem={activeNavbarItem}
        onSelect={setActiveNavbarItem}
      />

      <div className="preview-component-columns">
        <div className="preview-component-column">
          <FormPanel actions={renderer.actions} fieldId={`${instanceId}-project-name`} />
          <TemplateChoices groupName={`${instanceId}-template`} />
          <ActionPanel actions={renderer.actions} />
        </div>
        <div className="preview-component-column">
          <CardPanel actions={renderer.actions} />
          <ComponentTable activeView={activeView} onSelectView={setActiveView} />
          <DisclosurePanel />
        </div>
      </div>
    </div>
  );
}

function PreviewNavbar({
  name,
  actions,
  activeItem,
  onSelect,
}: {
  name: string;
  actions: ActionsDocument;
  activeItem: string;
  onSelect: (item: string) => void;
}) {
  return (
    <nav className="preview-navbar" aria-label={`${name} preview navigation`}>
      <span className="preview-navbar-brand">Brand</span>
      <div className="preview-navbar-links">
        {["Projects", "Team", "Insights"].map((item) => (
          <button
            type="button"
            key={item}
            data-selected={activeItem === item || undefined}
            aria-pressed={activeItem === item}
            onClick={() => onSelect(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <PreviewButton actions={actions} className="preview-navbar-action">
        New project
      </PreviewButton>
    </nav>
  );
}

function ActionPanel({ actions }: { actions: ActionsDocument }) {
  const labels = [
    "Start project",
    "Sign in",
    "See how it works",
    "Open in browser",
    "All downloads",
  ];
  const sizeCandidates = [
    actions.sizes.at(-1),
    actions.sizes.find(({ key }) => key === actions.defaultSize),
    actions.sizes[0],
  ].filter((size): size is ActionsDocument["sizes"][number] => Boolean(size));
  const sizes = [...new Map(sizeCandidates.map((size) => [size.key, size])).values()];

  return (
    <section className="preview-panel preview-actions-panel">
      <h3>Buttons</h3>
      <div className="preview-button-group">
        <div className="preview-button-group-controls">
          {actions.variants.map((variant, index) => (
            <PreviewButton actions={actions} variantKey={variant.key} key={variant.key}>
              {labels[index] ?? titleCase(variant.key)}
              {index === 0 ? <ArrowRightIcon aria-hidden="true" weight="bold" /> : null}
            </PreviewButton>
          ))}
        </div>
        <p className="preview-specimen-label">
          {actions.variants.map(({ key }) => titleCase(key)).join(" · ")}
        </p>
      </div>
      <div className="preview-button-group">
        <div className="preview-button-group-controls">
          {sizes.map((size, index) => (
            <PreviewButton actions={actions} sizeKey={size.key} key={size.key}>
              Open app
              {index < 2 ? <ArrowRightIcon aria-hidden="true" weight="bold" /> : null}
            </PreviewButton>
          ))}
          <PreviewButton actions={actions} disabled>
            Open app
          </PreviewButton>
        </div>
        <p className="preview-specimen-label">
          {sizes.map(({ key }) => titleCase(key)).join(" · ")} · Disabled
        </p>
      </div>
    </section>
  );
}

function FormPanel({ actions, fieldId }: { actions: ActionsDocument; fieldId: string }) {
  return (
    <section className="preview-panel preview-form-panel">
      <h3>Project settings</h3>
      <form onSubmit={(event) => event.preventDefault()}>
        <label className="preview-field-label" htmlFor={fieldId}>
          Project name
        </label>
        <div className="preview-input-group">
          <input id={fieldId} className="preview-field" defaultValue="Checkout refresh" />
          <PreviewButton actions={actions} type="submit">
            Save
          </PreviewButton>
        </div>
      </form>
      <div className="preview-option-list">
        <label className="preview-option-row">
          <span>
            <strong>Publish updates</strong>
            <small>Notify collaborators after saving</small>
          </span>
          <input className="preview-switch-input" type="checkbox" defaultChecked />
          <span className="preview-switch" aria-hidden="true">
            <i />
          </span>
        </label>
        <label className="preview-option-row preview-check-row">
          <input className="preview-checkbox-input" type="checkbox" defaultChecked />
          <span className="preview-checkbox" aria-hidden="true">
            <i />
          </span>
          <span>
            <strong>Include responsive states</strong>
            <small>Mobile, tablet, and wide layouts</small>
          </span>
        </label>
      </div>
    </section>
  );
}

function CardPanel({ actions }: { actions: ActionsDocument }) {
  const outlinedVariant = actions.variants.find(({ appearance }) => appearance === "outlined");
  return (
    <article className="preview-panel preview-card-panel">
      <header className="preview-card-header">
        <div>
          <span className="preview-label">Project</span>
          <h3>Checkout refresh</h3>
        </div>
        <span className="preview-status" data-tone="caution">
          <i />
          Draft
        </span>
      </header>
      <p className="preview-card-description">
        Navigation and form patterns for the next checkout release.
      </p>
      <dl className="preview-card-meta">
        <div>
          <dt>Owner</dt>
          <dd>Interface team</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>2 hours ago</dd>
        </div>
      </dl>
      <footer className="preview-card-footer">
        <span className="preview-status" data-tone="positive">
          <i />
          12 checks passed
        </span>
        <PreviewButton actions={actions} variantKey={outlinedVariant?.key}>
          View project
          <ArrowRightIcon aria-hidden="true" weight="bold" />
        </PreviewButton>
      </footer>
    </article>
  );
}

function ComponentTable({
  activeView,
  onSelectView,
}: {
  activeView: string;
  onSelectView: (view: string) => void;
}) {
  return (
    <section className="preview-panel preview-table-panel">
      <header className="preview-panel-header preview-table-header">
        <h3>Component inventory</h3>
        <div className="preview-tabs" role="group" aria-label="Table view">
          {["Overview", "Tokens", "Motion"].map((view) => (
            <button
              type="button"
              key={view}
              data-selected={activeView === view || undefined}
              aria-pressed={activeView === view}
              onClick={() => onSelectView(view)}
            >
              {view}
            </button>
          ))}
        </div>
      </header>
      <div className="preview-table-scroll">
        <table className="preview-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Variant</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            <ComponentRow name="Navigation" variant="Horizontal" status="Ready" tone="positive" />
            <ComponentRow name="Field" variant="Outline" status="Review" tone="caution" />
            <ComponentRow name="Dialog" variant="Modal" status="Blocked" tone="negative" />
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ComponentRow({
  name,
  variant,
  status,
  tone,
}: {
  name: string;
  variant: string;
  status: string;
  tone: string;
}) {
  return (
    <tr>
      <td>
        <strong>{name}</strong>
      </td>
      <td>{variant}</td>
      <td>
        <span className="preview-status" data-tone={tone}>
          <i />
          {status}
        </span>
      </td>
    </tr>
  );
}

function TemplateChoices({ groupName }: { groupName: string }) {
  return (
    <section className="preview-panel preview-choice-panel">
      <h3>Starting point</h3>
      <div className="preview-choice-list">
        <label className="preview-choice">
          <input type="radio" name={groupName} defaultChecked />
          <span className="preview-radio" aria-hidden="true">
            <i />
          </span>
          <span>
            <strong>Product workspace</strong>
            <small>Navigation, forms, and data</small>
          </span>
        </label>
        <label className="preview-choice">
          <input type="radio" name={groupName} />
          <span className="preview-radio" aria-hidden="true">
            <i />
          </span>
          <span>
            <strong>Marketing page</strong>
            <small>Hero, features, and pricing</small>
          </span>
        </label>
      </div>
    </section>
  );
}

function DisclosurePanel() {
  return (
    <section className="preview-panel preview-disclosure-panel">
      <h3>Review notes</h3>
      <div className="preview-disclosures">
        <details open>
          <summary>Component changes</summary>
          <p>Navigation, field states, and metadata were updated.</p>
        </details>
        <details>
          <summary>Accessibility checks</summary>
          <p>Focus order, labels, and contrast were reviewed.</p>
        </details>
      </div>
    </section>
  );
}

function createRendererStyle(renderer: PreviewRenderer): RendererStyle {
  return {
    ...Object.fromEntries(
      colorRoles.map((role) => [`--preview-color-${role}`, renderer.colors[role]]),
    ),
    ...Object.fromEntries(
      spaceRoles.map((role) => [`--preview-space-${role}`, `${renderer.geometry.space[role]}px`]),
    ),
    ...Object.fromEntries(
      radiusRoles.map((role) => [
        `--preview-radius-${role}`,
        `${renderer.geometry.radius[role]}px`,
      ]),
    ),
    ...Object.fromEntries(
      elevationRoles.map((role) => [`--preview-shadow-${role}`, renderer.elevation[role]]),
    ),
    ...Object.fromEntries(
      componentStyleRoles.map((role) => [
        `--preview-component-${role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
        renderer.componentStyles[role],
      ]),
    ),
    ...Object.fromEntries(
      typographyRoles.flatMap((role) => [
        [`--preview-type-${role}-family`, renderer.typography[role].runtimeFamily],
        [`--preview-type-${role}-size`, `${renderer.typography[role].size}px`],
        [`--preview-type-${role}-line`, String(renderer.typography[role].lineHeight)],
        [`--preview-type-${role}-weight`, String(renderer.typography[role].weight)],
        [`--preview-type-${role}-style`, renderer.typography[role].style],
        [`--preview-type-${role}-stretch`, renderer.typography[role].stretch],
        [
          `--preview-type-${role}-variations`,
          fontVariationSettings(renderer.typography[role].axes),
        ],
      ]),
    ),
    "--preview-control-height": `${renderer.geometry.controlHeight}px`,
  } as RendererStyle;
}

const fontVariationSettings = (axes: Array<{ tag: string; value: number }>) =>
  axes.length ? axes.map(({ tag, value }) => `"${tag}" ${value}`).join(", ") : "normal";

type PreviewButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
  actions: ActionsDocument;
  children: ReactNode;
  variantKey?: string;
  sizeKey?: string;
};

function PreviewButton({
  actions,
  children,
  variantKey = actions.defaultVariant,
  sizeKey = actions.defaultSize,
  className,
  type = "button",
  ...props
}: PreviewButtonProps) {
  const variant = actions.variants.find(({ key }) => key === variantKey) ?? actions.variants[0];
  const size = actions.sizes.find(({ key }) => key === sizeKey) ?? actions.sizes[0];
  if (!variant || !size) return null;

  const style = {
    "--preview-action-background": variant.background ?? "transparent",
    "--preview-action-foreground": variant.foreground ?? "currentColor",
    "--preview-action-border": variant.border ?? "transparent",
    "--preview-action-hover-background":
      variant.hover.background ?? variant.background ?? "transparent",
    "--preview-action-hover-foreground":
      variant.hover.foreground ?? variant.foreground ?? "currentColor",
    "--preview-action-hover-border": variant.hover.border ?? variant.border ?? "transparent",
    "--preview-action-disabled-background":
      variant.disabled.background ?? variant.background ?? "transparent",
    "--preview-action-disabled-foreground":
      variant.disabled.foreground ?? variant.foreground ?? "currentColor",
    "--preview-action-disabled-border": variant.disabled.border ?? variant.border ?? "transparent",
    "--preview-action-radius": `${actions.radius}px`,
    "--preview-action-height": `${size.height}px`,
    "--preview-action-padding-inline": `${size.paddingInline}px`,
    "--preview-action-font-size": `${size.fontSize}px`,
    "--preview-action-decoration-color": variant.decorationColor ?? "currentColor",
  } as RendererStyle;

  return (
    <button
      {...props}
      type={type}
      className={`preview-button${className ? ` ${className}` : ""}`}
      data-appearance={variant.appearance}
      data-decoration={variant.decoration}
      style={style}
    >
      {children}
    </button>
  );
}

function titleCase(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
