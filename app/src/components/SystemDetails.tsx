import {
  colorRoles,
  componentStyleRoles,
  elevationRoles,
  radiusRoles,
  spaceRoles,
  typographyRoles,
} from "../domain/design-system";
import type { DesignSystem } from "../data/catalog";
import { Panel } from "../design-system/components";
import { ColorSwatch } from "./ColorSwatch";
import "./SystemDetails.css";

export function SystemDetails({ system }: { system: DesignSystem }) {
  const ir = system.renderer;
  const typographyFamilies = [
    ...new Set(typographyRoles.map((role) => ir.typography[role].authoredFamily)),
  ];
  const actionColors = ir.actions.variants.flatMap((variant) =>
    (["background", "foreground", "border"] as const).flatMap((property) =>
      variant[property] ? [{ role: `${variant.key}-${property}`, value: variant[property] }] : [],
    ),
  );
  return (
    <div className="system-details mt-12 space-y-12">
      <section aria-labelledby="colors-heading">
        <h2 id="colors-heading" className="section-title">
          Color
        </h2>
        <div className="mt-4">
          <h3 className="meta-label text-muted">Foundations</h3>
          <div className="details-color-grid mt-3 gap-x-3 gap-y-4">
            {colorRoles.map((role) => (
              <ColorSwatch key={role} role={role} value={ir.colors[role]} />
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="meta-label text-muted">Components</h3>
            <div className="details-secondary-color-grid mt-3 gap-3">
              {componentStyleRoles.map((role) => (
                <ColorSwatch key={role} role={role} value={ir.componentStyles[role]} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="meta-label text-muted">Actions</h3>
            <div className="details-secondary-color-grid mt-3 gap-3">
              {actionColors.map(({ role, value }) => (
                <ColorSwatch key={role} role={role} value={value} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="type-heading">
        <h2 id="type-heading" className="section-title">
          Typography
        </h2>
        <div className="mt-4 overflow-hidden border border-line bg-surface">
          <div className="border-b border-line px-4 py-3">
            <span className="meta-label text-muted">{typographyFamilies.join(" / ")}</span>
          </div>
          <div className="details-type-grid gap-px bg-line">
            {typographyRoles.map((role) => {
              const type = ir.typography[role];
              return (
                <div
                  key={role}
                  className="min-w-0 bg-surface p-4"
                  style={{
                    fontFamily: type.runtimeFamily,
                    fontStyle: type.style,
                    fontStretch: type.stretch,
                    fontVariationSettings: type.axes.length
                      ? type.axes.map(({ tag, value }) => `"${tag}" ${value}`).join(", ")
                      : "normal",
                  }}
                >
                  <span className="text-xs font-semibold capitalize">{role}</span>
                  <p
                    className="mt-6 break-words"
                    style={{
                      fontSize: type.size,
                      lineHeight: type.lineHeight,
                      fontWeight: type.weight,
                    }}
                  >
                    Ag 0123
                  </p>
                  <code className="mt-4 block text-[11px] text-muted">
                    {type.authoredFamily} / {type.size}px / {type.lineHeight} / {type.weight}
                  </code>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="foundations-heading">
        <h2 id="foundations-heading" className="section-title">
          Geometry and elevation
        </h2>
        <div className="details-foundation-grid mt-4 gap-4">
          <Foundation title="Spacing">
            {spaceRoles.map((role) => (
              <div
                key={role}
                className="grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-3"
              >
                <span className="text-xs font-semibold">{role}</span>
                <i
                  className="block h-2 max-w-full bg-ink"
                  style={{ width: ir.geometry.space[role] }}
                />
                <code className="text-[11px] text-muted">{ir.geometry.space[role]}px</code>
              </div>
            ))}
          </Foundation>
          <Foundation title="Radius">
            {radiusRoles.map((role) => (
              <div key={role} className="flex items-center gap-3">
                <i
                  className="block size-9 border border-line bg-surface-subtle"
                  style={{ borderRadius: ir.geometry.radius[role] }}
                />
                <span className="w-12 text-xs font-semibold">{role}</span>
                <code className="text-[11px] text-muted">{ir.geometry.radius[role]}px</code>
              </div>
            ))}
          </Foundation>
          <Foundation title="Elevation">
            {elevationRoles.map((role) => (
              <div key={role} className="flex items-center gap-4">
                <i className="block size-10 bg-surface" style={{ boxShadow: ir.elevation[role] }} />
                <span className="text-xs font-semibold capitalize">{role}</span>
              </div>
            ))}
          </Foundation>
        </div>
      </section>

      <section aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="section-title">
          Principles
        </h2>
        <ol className="details-principles-grid mt-4 gap-3">
          {ir.principles.map((principle, index) => (
            <li key={principle} className="flex items-baseline gap-4 border-t border-line pt-4">
              <span className="font-mono text-[10px] font-bold text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-sm leading-6">{principle}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Foundation({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel radius="technical" className="p-4">
      <h3 className="card-title">{title}</h3>
      <div className="mt-4 grid gap-4">{children}</div>
    </Panel>
  );
}
