import { CheckInDetail } from "@/features/progress/components/CheckInDetail";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  return { title: metadataTitleFor(`/myskin/check-in/${date}`) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <CheckInDetail date={date} now={Date.now()} />;
}
