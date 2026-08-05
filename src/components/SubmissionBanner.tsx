import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { useEffect, useState } from "react";
import { IconButton, panelClassName } from "../design-system/components";
import { DesignSourcesVisual } from "./DesignSourcesVisual";

const submissionBannerStorageKey = "tokenshelf-submission-banner-dismissed";

export function SubmissionBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(localStorage.getItem(submissionBannerStorageKey) !== "true");
  }, []);

  function dismiss() {
    localStorage.setItem(submissionBannerStorageKey, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      className={panelClassName({
        className: "flex items-center gap-4 px-4 py-3 sm:gap-5 sm:px-5",
      })}
      aria-label="Submission announcement"
    >
      <span
        className="relative hidden h-[2.8rem] w-[3.675rem] shrink-0 sm:block"
        aria-hidden="true"
      >
        <span className="absolute start-0 top-0 block origin-top-left scale-[0.7]">
          <DesignSourcesVisual />
        </span>
      </span>
      <p className="max-w-3xl text-sm font-semibold leading-6 text-ink sm:text-base">
        Use your agent to submit your app&apos;s design system, get a sharable link, collect votes!
      </p>
      <IconButton
        label="Dismiss submission announcement"
        variant="quiet"
        className="ms-auto"
        onClick={dismiss}
      >
        <XIcon className="size-4" aria-hidden="true" />
      </IconButton>
    </aside>
  );
}
