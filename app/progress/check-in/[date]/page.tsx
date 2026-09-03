import { CheckInDetail } from "@/components/CheckInDetail";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

/* ⚠️ THE APP'S ONLY DYNAMIC ROUTE, so the title has to be generated rather than
   exported as a constant — `metadataTitleFor` is keyed by pathname and this
   pathname carries the date. `titleFor` matches the segment; see the
   check-in-detail note there for why the date is not in the title itself. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  return { title: metadataTitleFor(`/progress/check-in/${date}`) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <CheckInDetail date={date} />;
}
