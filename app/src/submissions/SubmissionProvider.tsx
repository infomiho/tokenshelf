import { createContext, useContext, type ReactNode } from "react";
import { useSubmissionController, type SubmissionContextValue } from "./useSubmissionController";

const SubmissionContext = createContext<SubmissionContextValue | null>(null);

export function SubmissionProvider({ children }: { children: ReactNode }) {
  const value = useSubmissionController();

  return <SubmissionContext.Provider value={value}>{children}</SubmissionContext.Provider>;
}

export function useSubmissions() {
  const value = useContext(SubmissionContext);
  if (!value) throw new Error("useSubmissions must be used inside SubmissionProvider");
  return value;
}
