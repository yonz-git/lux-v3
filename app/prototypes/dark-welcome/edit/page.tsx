import type { Metadata } from "next";
import { IndigoEditor } from "./IndigoEditor";

export const metadata: Metadata = { title: "Indigo Welcome editor · LUX" };

export default function Page() {
  return <IndigoEditor />;
}
