import { Toast as BaseToast } from "@base-ui/react/toast";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import type { ReactNode } from "react";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <BaseToast.Provider limit={3} timeout={3_500}>
      {children}
      <ToastViewport />
    </BaseToast.Provider>
  );
}

export function useToast() {
  const toastManager = BaseToast.useToastManager();

  return {
    dismiss(id: string) {
      toastManager.close(id);
    },
    success(message: string, id?: string) {
      return toastManager.add({ id, priority: "low", title: message, type: "success" });
    },
    error(message: string, id?: string) {
      return toastManager.add({
        id,
        priority: "high",
        title: message,
        timeout: 0,
        type: "error",
      });
    },
  };
}

function ToastViewport() {
  const { toasts } = BaseToast.useToastManager();

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport className="pointer-events-none fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-[var(--z-toast)] flex flex-col items-center gap-2 outline-none">
        {toasts.map((toast) => {
          const isError = toast.type === "error";

          return (
            <BaseToast.Root
              key={toast.id}
              toast={toast}
              swipeDirection={["up", "right"]}
              className={`pointer-events-auto flex max-w-[min(100%,32rem)] items-center gap-2 bg-ink px-3.5 py-2 text-surface shadow-[var(--shadow-floating)] transition-[opacity,translate] duration-200 data-[ending-style]:-translate-y-1 data-[ending-style]:opacity-0 data-[limited]:hidden data-[starting-style]:-translate-y-2 data-[starting-style]:opacity-0 motion-reduce:transition-none ${isError ? "rounded-[var(--radius-control)]" : "rounded-full"}`}
            >
              {isError ? (
                <WarningIcon className="size-3.5 shrink-0" weight="bold" aria-hidden="true" />
              ) : (
                <CheckIcon className="size-3.5 shrink-0" weight="bold" aria-hidden="true" />
              )}
              <BaseToast.Title
                className={`min-w-0 text-sm font-semibold ${isError ? "text-pretty" : "truncate"}`}
              >
                {toast.title}
              </BaseToast.Title>
              {isError && (
                <BaseToast.Close
                  className="-me-1 grid size-6 shrink-0 place-items-center rounded-full text-surface/70 hover:bg-surface/10 hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
                  aria-label="Dismiss notification"
                >
                  <XIcon className="size-3.5" weight="bold" aria-hidden="true" />
                </BaseToast.Close>
              )}
            </BaseToast.Root>
          );
        })}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}
