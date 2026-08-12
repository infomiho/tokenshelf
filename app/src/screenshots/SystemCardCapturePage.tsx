import { config } from "wasp/client";
import { useEffect, useState } from "react";
import { SystemPreview } from "../components/SystemPreview";
import { systemCardProfile, type CaptureData } from "./contracts";

export function SystemCardCapturePage() {
  const [capture, setCapture] = useState<CaptureData | null>(null);
  const [failed, setFailed] = useState(false);
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = new URL(config.apiUrl);
    apiUrl.hostname = window.location.hostname;
    void fetch(
      `${apiUrl.href.replace(/\/$/, "")}${systemCardProfile.dataPath}?token=${encodeURIComponent(token)}`,
      { signal: controller.signal, credentials: "omit" },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Capture data unavailable.");
        setCapture((await response.json()) as CaptureData);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, [token]);

  if (failed) return <p>Capture unavailable</p>;
  if (!capture) return null;
  return <CaptureTarget capture={capture} />;
}

function CaptureTarget({ capture }: { capture: CaptureData }) {
  return (
    <main
      data-screenshot-target
      className="overflow-hidden"
      style={{ width: systemCardProfile.width, height: systemCardProfile.height }}
    >
      <SystemPreview system={capture} projection="card" decorative />
    </main>
  );
}
