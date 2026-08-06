import { useEffect, useState } from "react";
import { SubmitOnboardingDialogView } from "./SubmitOnboardingDialogView";

const onboardingStorageKey = "tokenshelf-submit-onboarding-seen";

export function SubmitOnboardingDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(localStorage.getItem(onboardingStorageKey) !== "true");
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) localStorage.setItem(onboardingStorageKey, "true");
  }

  return <SubmitOnboardingDialogView open={open} onOpenChange={handleOpenChange} />;
}
