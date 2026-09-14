import type { Metadata } from "next";
import { IndigoEditor } from "./IndigoEditor";

/* ⚠️ PROTOTYPE SURFACE — the Indigo variant alone, for editing in DevTools.
   Delete with the rest of app/prototypes/dark-welcome once a direction is
   picked. */
export const metadata: Metadata = { title: "Indigo Welcome editor · LUX" };

export default function Page() {
  return <IndigoEditor />;
}
