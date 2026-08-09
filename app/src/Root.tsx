import { Outlet, ScrollRestoration } from "react-router";
import { ToastProvider } from "./design-system/components";

export default function Root() {
  return (
    <ToastProvider>
      <Outlet />
      <ScrollRestoration />
    </ToastProvider>
  );
}
