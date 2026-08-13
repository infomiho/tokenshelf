import type { AnimationEvent } from "react";

export function AnimatedCursorCue({
  onActivate,
  onComplete,
}: {
  onActivate: () => void;
  onComplete: () => void;
}) {
  function handleActivation(event: AnimationEvent<HTMLSpanElement>) {
    if (event.animationName === "preview-cursor-activate") onActivate();
  }

  function handleCueEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && event.animationName === "preview-cursor-move")
      onComplete();
  }

  return (
    <div className="animated-cursor-cue" aria-hidden="true" onAnimationEnd={handleCueEnd}>
      <span className="animated-cursor-activation" onAnimationStart={handleActivation} />
      <span className="animated-cursor-flare">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <img
        src="/icons/clarity-cursor-hand-solid-white.svg"
        className="animated-cursor-pointer"
        alt=""
      />
    </div>
  );
}
