import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { Link } from "wasp/client/router";
import { actionLinkClassName } from "../design-system/components";
import { LogoMark } from "../design-system/components";

export function NotFoundContent() {
  return (
    <section className="mx-auto grid min-h-[70vh] max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(22rem,1fr)] lg:gap-20 lg:px-12">
      <div>
        <h1 className="page-title">Nothing on this shelf</h1>
        <p className="page-lede">Check the address or return to the library.</p>
        <Link to="/" className={actionLinkClassName("primary", "mt-7")}>
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Back to top picks
        </Link>
      </div>

      <div
        className="not-found-visual relative isolate aspect-[4/3] overflow-hidden rounded-[var(--radius-hero)] text-on-feature"
        aria-hidden="true"
      >
        <LogoMark className="absolute start-7 top-7 size-10 text-brand" />
        <span className="absolute end-7 top-3 text-[7rem] font-black leading-none tracking-[-0.08em] text-white/10 [font-family:var(--font-brand)] sm:text-[9rem]">
          404
        </span>
        <div className="absolute inset-x-[10%] bottom-[17%] h-px bg-feature-line shadow-[0_-6rem_0_var(--feature-line)]" />
        <div className="absolute inset-x-[14%] bottom-[17%] flex h-28 items-end gap-3">
          <span className="h-16 flex-1 rounded-t-[var(--radius-technical)] border border-feature-line bg-white/[0.05]" />
          <span className="h-24 flex-1 rounded-t-[var(--radius-technical)] border border-feature-line bg-white/[0.05]" />
          <span className="relative h-20 flex-1 rounded-t-[var(--radius-technical)] border border-brand/80 bg-brand/10">
            <i className="absolute start-1/2 top-1/2 block size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-e border-b border-brand" />
          </span>
          <span className="h-12 flex-1 rounded-t-[var(--radius-technical)] border border-feature-line bg-white/[0.05]" />
          <span className="h-20 flex-1 rounded-t-[var(--radius-technical)] border border-feature-line bg-white/[0.05]" />
        </div>
        <span className="absolute bottom-[calc(17%+6rem)] start-[51%] h-10 w-px -translate-x-1/2 bg-brand/60" />
        <span className="absolute bottom-[calc(17%+8.5rem)] start-[51%] size-2 -translate-x-1/2 rounded-[var(--radius-round)] bg-brand" />
      </div>
    </section>
  );
}
