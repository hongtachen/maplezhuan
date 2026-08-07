import type { Metadata } from "next";
import { buildListingMetadata } from "@/lib/share/listingMetadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return buildListingMetadata("sublet", id);
}

export default function SubletDetailLayout({ children }: Props) {
  return children;
}
