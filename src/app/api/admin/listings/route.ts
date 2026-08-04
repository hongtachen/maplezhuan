import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

type ListingType = "item" | "sublet";

function mapDoc(type: ListingType, id: string, data: Record<string, unknown>) {
  const title =
    type === "item"
      ? (data.title as string) || ""
      : (data.title as string) ||
        `${data.propertyType || ""} ${data.spaceType || ""}`.trim() ||
        "转租";

  return {
    id,
    type,
    title,
    price: typeof data.price === "number" ? data.price : 0,
    status: (data.status as string) || "",
    sellerId: (data.sellerId as string) || "",
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    moderationStatus: (data.moderationStatus as string) || "approved",
    isHidden: !!data.isHidden,
    hiddenReason: (data.hiddenReason as string) || "",
    createdAt: data.createdAt ?? null,
    location:
      type === "item"
        ? (data.location as string) || (data.city as string) || ""
        : (data.address as string) || (data.city as string) || "",
    description: (data.description as string) || "",
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const typeParam = url.searchParams.get("type") || "all";
  const search = (url.searchParams.get("search") || "").trim().toLowerCase();
  const sellerId = (url.searchParams.get("sellerId") || "").trim();
  const hidden = url.searchParams.get("hidden");
  const moderationStatus = url.searchParams.get("moderationStatus");
  const status = url.searchParams.get("status");
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") || 200), 1),
    500,
  );

  const db = getAdminFirestore();
  const fetchItems = typeParam === "all" || typeParam === "item";
  const fetchSublets = typeParam === "all" || typeParam === "sublet";

  const [itemsSnap, subletsSnap] = await Promise.all([
    fetchItems
      ? db.collection("items").orderBy("createdAt", "desc").limit(300).get()
      : Promise.resolve(null),
    fetchSublets
      ? db.collection("sublets").orderBy("createdAt", "desc").limit(300).get()
      : Promise.resolve(null),
  ]);

  let listings = [
    ...(itemsSnap
      ? itemsSnap.docs.map((d) =>
          mapDoc("item", d.id, d.data() as Record<string, unknown>),
        )
      : []),
    ...(subletsSnap
      ? subletsSnap.docs.map((d) =>
          mapDoc("sublet", d.id, d.data() as Record<string, unknown>),
        )
      : []),
  ];

  if (sellerId) {
    listings = listings.filter((l) => l.sellerId === sellerId);
  }
  if (hidden === "true") {
    listings = listings.filter((l) => l.isHidden);
  } else if (hidden === "false") {
    listings = listings.filter((l) => !l.isHidden);
  }
  if (moderationStatus) {
    listings = listings.filter((l) => l.moderationStatus === moderationStatus);
  }
  if (status) {
    listings = listings.filter((l) => l.status === status);
  }
  if (search) {
    listings = listings.filter(
      (l) =>
        l.title.toLowerCase().includes(search) ||
        l.id.toLowerCase().includes(search) ||
        l.sellerId.toLowerCase().includes(search) ||
        l.location.toLowerCase().includes(search) ||
        l.description.toLowerCase().includes(search),
    );
  }

  listings.sort((a, b) => {
    const aSec =
      a.createdAt && typeof a.createdAt === "object" && "seconds" in a.createdAt
        ? (a.createdAt as { seconds: number }).seconds
        : 0;
    const bSec =
      b.createdAt && typeof b.createdAt === "object" && "seconds" in b.createdAt
        ? (b.createdAt as { seconds: number }).seconds
        : 0;
    return bSec - aSec;
  });

  listings = listings.slice(0, limit);

  const sellerIds = [
    ...new Set(listings.map((l) => l.sellerId).filter(Boolean)),
  ];
  const sellerMap: Record<string, { nickname: string; avatarUrl: string }> = {};
  await Promise.all(
    sellerIds.map(async (id) => {
      const u = await db.doc(`users/${id}`).get();
      const d = u.data();
      sellerMap[id] = {
        nickname: (d?.nickname as string) || "用户",
        avatarUrl: (d?.avatarUrl as string) || "",
      };
    }),
  );

  return NextResponse.json({
    listings: listings.map((l) => ({
      ...l,
      sellerNickname: sellerMap[l.sellerId]?.nickname || "",
      sellerAvatar: sellerMap[l.sellerId]?.avatarUrl || "",
    })),
  });
}
