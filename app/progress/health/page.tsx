import { SkinHealth } from "@/features/progress/components/SkinHealth";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

export const metadata: Metadata = { title: metadataTitleFor("/progress/health") };

export const dynamic = "force-dynamic";

export default function Page() {
  return <SkinHealth now={Date.now()} />;
}
