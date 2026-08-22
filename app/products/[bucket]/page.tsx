import { notFound } from "next/navigation";
import { BucketProductsList } from "@/components/BucketProductsList";
import { BUCKETS, type BucketId } from "@/lib/products";

/**
 * A period's product list — `Long-term products list` (581:1593 / 583:1924).
 *
 * Only the long-term list is drawn, but `My Products` links to all three
 * periods and the screen is entirely bucket-derived, so one dynamic route
 * serves them rather than two of the three links going nowhere.
 *
 * `/products/added` is a static sibling and wins over this segment, so the
 * confirmation screen is never mistaken for a bucket named "added".
 */
export function generateStaticParams() {
  return BUCKETS.map((b) => ({ bucket: b.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ bucket: string }>;
}) {
  const { bucket } = await params;
  if (!BUCKETS.some((b) => b.id === bucket)) notFound();
  return <BucketProductsList bucket={bucket as BucketId} />;
}
