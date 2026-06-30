/** Shared browse / filter option definitions — store IDs internally, show Chinese labels in UI. */

import {
  Tags,
  Sofa,
  Laptop,
  CookingPot,
  BookOpen,
  ShoppingBag,
  Baby,
  Shirt,
  Dumbbell,
  Package,
} from "lucide-react";

export const ITEM_CATEGORIES = [
  { id: "all", label: "全部分类", shortLabel: "全部分类", icon: Tags },
  { id: "furniture", label: "家具", shortLabel: "家具", icon: Sofa },
  {
    id: "electronics",
    label: "电子商品",
    shortLabel: "电子商品",
    icon: Laptop,
  },
  { id: "kitchen", label: "厨具", shortLabel: "厨具", icon: CookingPot },
  { id: "study", label: "学习办公", shortLabel: "学习办公", icon: BookOpen },
  {
    id: "living",
    label: "生活用品",
    shortLabel: "生活用品",
    icon: ShoppingBag,
  },
  { id: "baby", label: "婴儿用品", shortLabel: "婴儿用品", icon: Baby },
  { id: "clothes", label: "服饰鞋包", shortLabel: "服饰鞋包", icon: Shirt },
  { id: "sports", label: "运动商品", shortLabel: "运动商品", icon: Dumbbell },
  { id: "other", label: "其他", shortLabel: "其他", icon: Package },
] as const;

/** Room type IDs match publish/sublet step2. */
export const SUBLET_ROOM_TYPES = [
  { id: "不限", label: "不限" },
  { id: "studio", label: "Studio · 开放式" },
  { id: "1b1b", label: "一房一卫" },
  { id: "2b2b", label: "两房两卫" },
  { id: "ensuite", label: "Ensuite · 独立卫浴" },
  { id: "shared", label: "合租" },
  { id: "room", label: "单间" },
  { id: "other", label: "其他" },
] as const;

export const SUBLET_LEASE_TERMS = [
  "不限",
  "1个月",
  "4个月",
  "8个月",
  "12个月",
  "1年以上",
  "可商量",
] as const;

export const SUBLET_RENEWABLE_OPTIONS = ["不限", "可续租", "不可续租"] as const;

const CATEGORY_LABEL_MAP = Object.fromEntries(
  ITEM_CATEGORIES.map((c) => [c.id, c.shortLabel]),
) as Record<string, string>;

const ROOM_TYPE_LABEL_MAP = Object.fromEntries(
  SUBLET_ROOM_TYPES.map((r) => [r.id, r.label]),
) as Record<string, string>;

/** Preset room type IDs used at publish time (excludes 不限 / 其他). */
const PRESET_ROOM_TYPE_IDS = new Set<string>(
  SUBLET_ROOM_TYPES.map((r) => r.id).filter(
    (id) => id !== "不限" && id !== "other",
  ),
);

export function isCustomRoomType(roomType?: string): boolean {
  if (!roomType) return false;
  return !PRESET_ROOM_TYPE_IDS.has(roomType) && roomType !== "other";
}

/** Match room type filter — custom publish text counts as 其他. */
export function matchesRoomType(filter: string, stored?: string): boolean {
  if (filter === "不限") return true;
  if (!stored) return false;
  if (filter === "other") {
    return stored === "other" || isCustomRoomType(stored);
  }
  return filter === stored;
}

/** Common Canadian cities — bilingual display for browse filters. */
const CITY_BILINGUAL: Record<string, string> = {
  Toronto: "多伦多",
  Vancouver: "温哥华",
  Montreal: "蒙特利尔",
  Ottawa: "渥太华",
  Calgary: "卡尔加里",
  Edmonton: "埃德蒙顿",
  Winnipeg: "温尼伯",
  Hamilton: "汉密尔顿",
  "Quebec City": "魁北克城",
  London: "伦敦",
  Victoria: "维多利亚",
  Halifax: "哈利法克斯",
  Saskatoon: "萨斯卡通",
  Regina: "里贾纳",
  Mississauga: "密西沙加",
  Markham: "万锦",
  Richmond: "列治文",
  Burnaby: "本拿比",
  Waterloo: "滑铁卢",
  Kingston: "金斯顿",
};

export function getCategoryLabel(id: string): string {
  return CATEGORY_LABEL_MAP[id] ?? id;
}

export function getRoomTypeLabel(id: string): string {
  return ROOM_TYPE_LABEL_MAP[id] ?? id;
}

/** Display move-in date on sublet detail (flexible → 时间灵活). */
export function formatMoveInDate(moveInDate?: string): string {
  if (!moveInDate) return "随时入住";
  if (moveInDate === "flexible") return "时间灵活";
  const iso = moveInDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const [, year, month, day] = iso;
    return `${year}年${Number(month)}月${Number(day)}日`;
  }
  return moveInDate;
}

/** Bilingual city label for filter chips / search bar, e.g. "Toronto · 多伦多". */
export function formatCityLabel(city: string): string {
  if (city === "全部城市") return city;
  const zh = CITY_BILINGUAL[city];
  if (zh) return `${city} · ${zh}`;
  // Already Chinese or unknown — show as stored
  return city;
}

/** Match lease term filter against stored value (handles 12个月 vs 1年以上 grouping). */
export function matchesLeaseTerm(filter: string, stored?: string): boolean {
  if (filter === "不限" || !stored) return filter === "不限";
  if (filter === stored) return true;
  if (filter === "1年以上" && (stored === "1年以上" || stored === "12个月"))
    return true;
  return false;
}
