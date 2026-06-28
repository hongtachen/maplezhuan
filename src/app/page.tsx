"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import ListingCard, { ListingCardData } from "@/components/app/ListingCard";
import MobileFilterModal from "@/components/app/MobileFilterModal";
import { DURATION, EASE } from "@/lib/motion/tokens";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner, { PageLoading } from "@/components/ui/LoadingSpinner";

import { useItems, useSublets } from "@/hooks/useListings";
import { extractUniqueCities, buildLocationOptions } from "@/lib/listingCities";
import {
  ITEM_CATEGORIES,
  SUBLET_ROOM_TYPES,
  SUBLET_LEASE_TERMS,
  SUBLET_RENEWABLE_OPTIONS,
  getCategoryLabel,
  getRoomTypeLabel,
  formatCityLabel,
  matchesLeaseTerm,
} from "@/lib/browseFilters";

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<"item" | "sublet">("item");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { items, loading: itemsLoading } = useItems();
  const { sublets, loading: subletsLoading } = useSublets();
  const [isFilterBusy, setIsFilterBusy] = useState(false);

  // Map backend documents to ListingCardData (hooks already filter to 在售 / 招租中)
  const ACTIVE_LISTINGS: ListingCardData[] = items.map((item) => ({
    id: item.id || "unknown",
    type: "item",
    title: item.title,
    price: item.price,
    location: item.location,
    city: item.city || item.locationData?.city,
    neighbourhood: "",
    condition: item.condition,
    rating: 5.0,
    status: "available",
    image: item.images?.[0],
    itemCategory: item.category,
  }));

  const ACTIVE_SUBLETS: ListingCardData[] = sublets.map((sublet) => ({
    id: sublet.id || "unknown",
    type: "sublet",
    title:
      sublet.title ||
      `${sublet.roomTypes?.[0] || "房间"} in ${sublet.propertyType}`,
    price: sublet.price,
    priceUnit: "/月",
    location: sublet.address,
    city: sublet.city || sublet.locationData?.city,
    neighbourhood: sublet.hideAddress ? "隐蔽地址" : "",
    rating: 5.0,
    status: "available",
    image: sublet.images?.[0],
    roomType: sublet.roomTypes?.[0],
    subletTerm: sublet.leaseTerms?.[0],
    renewable:
      sublet.renewable === true
        ? "可续租"
        : sublet.renewable === false
          ? "不可续租"
          : undefined,
  }));

  const itemCities = extractUniqueCities(items);
  const subletCities = extractUniqueCities(sublets);
  const itemLocationOptions = buildLocationOptions(itemCities);
  const subletLocationOptions = buildLocationOptions(subletCities);

  const searchBarRef = useRef<HTMLDivElement>(null);

  // Filter States (Draft) — location is split per tab
  const [itemLocation, setItemLocation] = useState("全部城市");
  const [subletLocation, setSubletLocation] = useState("全部城市");
  const [subletTerm, setSubletTerm] = useState("不限");
  const [roomType, setRoomType] = useState("不限");
  const [renewable, setRenewable] = useState("不限");
  const [itemCategory, setItemCategory] = useState("all");
  const [keyword, setKeyword] = useState("");

  const location = activeTab === "item" ? itemLocation : subletLocation;
  const setLocation = (city: string) => {
    if (activeTab === "item") setItemLocation(city);
    else setSubletLocation(city);
  };
  const locationOptions =
    activeTab === "item" ? itemLocationOptions : subletLocationOptions;

  // Filter States (Applied)
  const [appliedFilters, setAppliedFilters] = useState({
    itemLocation: "全部城市",
    subletLocation: "全部城市",
    subletTerm: "不限",
    roomType: "不限",
    renewable: "不限",
    itemCategory: "all",
    keyword: "",
  });

  const appliedLocation =
    activeTab === "item"
      ? appliedFilters.itemLocation
      : appliedFilters.subletLocation;

  // Reset city filter when selected city no longer has listings in that tab
  useEffect(() => {
    if (itemLocation !== "全部城市" && !itemCities.includes(itemLocation)) {
      setTimeout(() => {
        setItemLocation("全部城市");
        setAppliedFilters((prev) => ({ ...prev, itemLocation: "全部城市" }));
      }, 0);
    }
  }, [itemCities, itemLocation]);

  useEffect(() => {
    if (
      subletLocation !== "全部城市" &&
      !subletCities.includes(subletLocation)
    ) {
      setTimeout(() => {
        setSubletLocation("全部城市");
        setAppliedFilters((prev) => ({ ...prev, subletLocation: "全部城市" }));
      }, 0);
    }
  }, [subletCities, subletLocation]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const bumpFilterBusy = () => {
    setIsFilterBusy(true);
    window.setTimeout(() => setIsFilterBusy(false), 400);
  };

  const handleApplySearch = () => {
    setActiveDropdown(null);
    bumpFilterBusy();
    setAppliedFilters({
      itemLocation,
      subletLocation,
      subletTerm,
      roomType,
      renewable,
      itemCategory,
      keyword,
    });
    setShowMobileFilter(false);
  };

  const handleClearKeyword = (e: React.MouseEvent) => {
    e.stopPropagation();
    bumpFilterBusy();
    setKeyword("");
    setAppliedFilters((prev) => ({ ...prev, keyword: "" }));
  };

  const handleClearFilters = () => {
    bumpFilterBusy();
    setItemLocation("全部城市");
    setSubletLocation("全部城市");
    setSubletTerm("不限");
    setRoomType("不限");
    setRenewable("不限");
    setItemCategory("all");
    setKeyword("");

    setAppliedFilters({
      itemLocation: "全部城市",
      subletLocation: "全部城市",
      subletTerm: "不限",
      roomType: "不限",
      renewable: "不限",
      itemCategory: "all",
      keyword: "",
    });

    // Close dropdowns and mobile modal
    setActiveDropdown(null);
    setShowMobileFilter(false);
  };

  const hasFilters =
    (activeTab === "item"
      ? itemLocation !== "全部城市"
      : subletLocation !== "全部城市") ||
    subletTerm !== "不限" ||
    roomType !== "不限" ||
    renewable !== "不限" ||
    itemCategory !== "all" ||
    keyword !== "";

  const hasAppliedFilters =
    (activeTab === "item"
      ? appliedFilters.itemLocation !== "全部城市"
      : appliedFilters.subletLocation !== "全部城市") ||
    appliedFilters.subletTerm !== "不限" ||
    appliedFilters.roomType !== "不限" ||
    appliedFilters.renewable !== "不限" ||
    appliedFilters.itemCategory !== "all" ||
    appliedFilters.keyword.trim() !== "";

  const baseListings = activeTab === "item" ? ACTIVE_LISTINGS : ACTIVE_SUBLETS;
  const isLoading = activeTab === "item" ? itemsLoading : subletsLoading;
  const showResultsBusy = isLoading || isFilterBusy;

  // Filtering Logic
  const activeListings = baseListings.filter((listing) => {
    const locFilter =
      activeTab === "item"
        ? appliedFilters.itemLocation
        : appliedFilters.subletLocation;

    if (locFilter !== "全部城市") {
      const listingCity = listing.city?.trim();
      if (listingCity) {
        if (listingCity !== locFilter) return false;
      } else if (!listing.location?.includes(locFilter)) {
        return false;
      }
    }

    // 2. Filter by Keyword
    if (appliedFilters.keyword.trim() !== "") {
      if (
        !listing.title
          .toLowerCase()
          .includes(appliedFilters.keyword.toLowerCase())
      )
        return false;
    }

    if (activeTab === "item") {
      // 3. Filter by Category (for items)
      if (appliedFilters.itemCategory !== "all") {
        if (listing.itemCategory !== appliedFilters.itemCategory) return false;
      }
    } else {
      if (
        appliedFilters.subletTerm !== "不限" &&
        !matchesLeaseTerm(appliedFilters.subletTerm, listing.subletTerm)
      ) {
        return false;
      }
      if (
        appliedFilters.roomType !== "不限" &&
        listing.roomType !== appliedFilters.roomType
      ) {
        return false;
      }
      if (
        appliedFilters.renewable !== "不限" &&
        listing.renewable !== appliedFilters.renewable
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Search Header Area */}
      <header className="sticky top-0 z-40 bg-[#f3fbf7] px-4 md:px-8 pt-4 pb-4 md:pt-6">
        <div className="max-w-[1280px] mx-auto">
          {/* Category Toggle */}
          <div className="flex items-center justify-center mb-6 w-full">
            <div className="flex items-center bg-white rounded-full p-1 border border-[rgba(31,41,51,0.08)] shadow-sm">
              <button
                onClick={() => setActiveTab("item")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === "item"
                    ? "bg-[#f3fbf7] text-[#2f9e6d] shadow-sm"
                    : "text-[#5a6b73] hover:text-[#1f2933]"
                }`}
              >
                🏷️ 闲置
              </button>
              <button
                onClick={() => setActiveTab("sublet")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === "sublet"
                    ? "bg-indigo-50 text-indigo-600 shadow-sm"
                    : "text-[#5a6b73] hover:text-[#1f2933]"
                }`}
              >
                🏠 转租
              </button>
            </div>
          </div>

          {/* Desktop Search Bar (hidden on mobile) */}
          <div
            ref={searchBarRef}
            className="hidden md:flex relative items-center bg-white rounded-full border border-[rgba(31,41,51,0.08)] shadow-[0_8px_24px_rgba(31,41,51,0.04)] mb-4"
          >
            {/* Location */}
            <div
              onClick={() =>
                setActiveDropdown(
                  activeDropdown === "location" ? null : "location",
                )
              }
              className={`relative flex-1 px-6 py-3 cursor-pointer rounded-full transition-colors ${activeDropdown === "location" ? "bg-gray-100 shadow-inner" : "hover:bg-gray-50"}`}
            >
              <label className="block text-[10px] font-bold text-[#1f2933] mb-0.5 cursor-pointer">
                地点
              </label>
              <div className="text-sm text-[#1f2933] truncate font-medium">
                {formatCityLabel(location)}
              </div>

              {/* Location Dropdown */}
              {activeDropdown === "location" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-[120%] left-0 w-[300px] bg-white rounded-3xl p-6 shadow-[0_12px_48px_rgba(0,0,0,0.1)] border border-[rgba(31,41,51,0.04)] z-50 cursor-default"
                >
                  <div className="flex flex-wrap gap-2">
                    {locationOptions.length <= 1 ? (
                      <p className="text-sm text-[#5a6b73]">
                        {activeTab === "item"
                          ? "暂无闲置城市数据，发布商品后会自动出现"
                          : "暂无转租城市数据，发布房源后会自动出现"}
                      </p>
                    ) : (
                      locationOptions.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setLocation(city);
                            setActiveDropdown(
                              activeTab === "item" ? "category" : "subletTerm",
                            );
                          }}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            location === city
                              ? "bg-[#f3fbf7] border-[#2f9e6d] text-[#2f9e6d] font-semibold"
                              : "border-[rgba(31,41,51,0.15)] text-[#5a6b73] hover:border-[#2f9e6d]"
                          }`}
                        >
                          {formatCityLabel(city)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-[1px] h-8 bg-[rgba(31,41,51,0.08)]"></div>

            {activeTab === "item" ? (
              <>
                <div className="flex-[2] px-6 py-3 hover:bg-gray-50 transition-colors flex items-center">
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-[#1f2933] mb-0.5 cursor-pointer">
                      关键词
                    </label>
                    <input
                      type="text"
                      placeholder="搜索物品名称..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleApplySearch()
                      }
                      className="w-full bg-transparent outline-none text-sm text-[#1f2933] placeholder-[#5a6b73] font-medium"
                    />
                  </div>
                  {keyword && (
                    <button
                      onClick={handleClearKeyword}
                      className="w-5 h-5 shrink-0 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300 ml-2 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="w-[1px] h-8 bg-[rgba(31,41,51,0.08)]"></div>

                <div
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "category" ? null : "category",
                    )
                  }
                  className={`relative flex-1 px-6 py-3 cursor-pointer rounded-full transition-colors ${activeDropdown === "category" ? "bg-gray-100 shadow-inner" : "hover:bg-gray-50"}`}
                >
                  <label className="block text-[10px] font-bold text-[#1f2933] mb-0.5 cursor-pointer">
                    分类
                  </label>
                  <div className="text-sm text-[#1f2933] truncate font-medium">
                    {getCategoryLabel(itemCategory)}
                  </div>

                  {/* Category Dropdown */}
                  {activeDropdown === "category" && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-[120%] right-0 w-[350px] bg-white rounded-3xl p-6 shadow-[0_12px_48px_rgba(0,0,0,0.1)] border border-[rgba(31,41,51,0.04)] z-50 cursor-default"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        {ITEM_CATEGORIES.filter((c) => c.id !== "other").map(
                          (c) => {
                            const Icon = c.icon;
                            return (
                              <button
                                key={c.id}
                                onClick={() => {
                                  setItemCategory(c.id);
                                  setActiveDropdown(null);
                                }}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                                  itemCategory === c.id
                                    ? "bg-[#f3fbf7] border-[#2f9e6d] text-[#2f9e6d]"
                                    : "border-[rgba(31,41,51,0.12)] bg-white hover:border-[#2f9e6d] text-[#5a6b73]"
                                }`}
                              >
                                <Icon className="w-6 h-6" strokeWidth={1.5} />
                                <span
                                  className={`text-xs ${itemCategory === c.id ? "font-bold" : ""}`}
                                >
                                  {c.id === "all" ? "全部" : c.label}
                                </span>
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "subletTerm" ? null : "subletTerm",
                    )
                  }
                  className={`relative flex-1 px-6 py-3 cursor-pointer rounded-full transition-colors ${activeDropdown === "subletTerm" ? "bg-gray-100 shadow-inner" : "hover:bg-gray-50"}`}
                >
                  <label className="block text-[10px] font-bold text-[#1f2933] mb-0.5 cursor-pointer">
                    租期
                  </label>
                  <div className="text-sm text-[#1f2933] truncate font-medium">
                    {subletTerm}
                  </div>

                  {/* Sublet Term Dropdown */}
                  {activeDropdown === "subletTerm" && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-[120%] left-0 w-[300px] bg-white rounded-3xl p-6 shadow-[0_12px_48px_rgba(0,0,0,0.1)] border border-[rgba(31,41,51,0.04)] z-50 cursor-default"
                    >
                      <div className="flex flex-col gap-2">
                        {SUBLET_LEASE_TERMS.map((term) => (
                          <button
                            key={term}
                            onClick={() => {
                              setSubletTerm(term);
                              setActiveDropdown("roomType");
                            }}
                            className={`px-4 py-3 rounded-xl text-sm border text-left transition-colors ${
                              subletTerm === term
                                ? "bg-[#f3fbf7] border-[#2f9e6d] text-[#2f9e6d] font-semibold"
                                : "border-[rgba(31,41,51,0.15)] text-[#1f2933] hover:border-[#2f9e6d]"
                            }`}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-[1px] h-8 bg-[rgba(31,41,51,0.08)]"></div>

                <div
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "roomType" ? null : "roomType",
                    )
                  }
                  className={`relative flex-1 px-6 py-3 cursor-pointer rounded-full transition-colors ${activeDropdown === "roomType" ? "bg-gray-100 shadow-inner" : "hover:bg-gray-50"}`}
                >
                  <label className="block text-[10px] font-bold text-[#1f2933] mb-0.5 cursor-pointer">
                    房型
                  </label>
                  <div className="text-sm text-[#1f2933] truncate font-medium">
                    {getRoomTypeLabel(roomType)}
                  </div>

                  {/* Room Type Dropdown */}
                  {activeDropdown === "roomType" && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-[120%] left-1/2 -translate-x-1/2 w-[350px] bg-white rounded-3xl p-6 shadow-[0_12px_48px_rgba(0,0,0,0.1)] border border-[rgba(31,41,51,0.04)] z-50 cursor-default"
                    >
                      <div className="flex flex-wrap gap-2">
                        {SUBLET_ROOM_TYPES.map((rt) => (
                          <button
                            key={rt.id}
                            onClick={() => {
                              setRoomType(rt.id);
                              setActiveDropdown("renewable");
                            }}
                            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                              roomType === rt.id
                                ? "bg-[#f3fbf7] border-[#2f9e6d] text-[#2f9e6d] font-semibold"
                                : "border-[rgba(31,41,51,0.15)] text-[#5a6b73] hover:border-[#2f9e6d]"
                            }`}
                          >
                            {rt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-[1px] h-8 bg-[rgba(31,41,51,0.08)]"></div>

                <div
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "renewable" ? null : "renewable",
                    )
                  }
                  className={`relative flex-1 px-6 py-3 cursor-pointer rounded-full transition-colors ${activeDropdown === "renewable" ? "bg-gray-100 shadow-inner" : "hover:bg-gray-50"}`}
                >
                  <label className="block text-[10px] font-bold text-[#1f2933] mb-0.5 cursor-pointer">
                    续租要求
                  </label>
                  <div className="text-sm text-[#1f2933] truncate font-medium">
                    {renewable}
                  </div>

                  {/* Renewable Dropdown */}
                  {activeDropdown === "renewable" && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-[120%] right-0 w-[200px] bg-white rounded-3xl p-4 shadow-[0_12px_48px_rgba(0,0,0,0.1)] border border-[rgba(31,41,51,0.04)] z-50 cursor-default"
                    >
                      <div className="flex flex-col gap-2">
                        {SUBLET_RENEWABLE_OPTIONS.map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setRenewable(r);
                              setActiveDropdown(null);
                            }}
                            className={`px-4 py-3 rounded-xl text-sm border text-left transition-colors ${
                              renewable === r
                                ? "bg-[#f3fbf7] border-[#2f9e6d] text-[#2f9e6d] font-semibold"
                                : "border-transparent text-[#1f2933] hover:bg-gray-50"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Clear Filters Button (Desktop) */}
            {hasFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFilters();
                }}
                disabled={isFilterBusy}
                className="text-xs font-medium text-[#5a6b73] hover:text-[#1f2933] px-3 transition-colors disabled:opacity-50"
              >
                {isFilterBusy ? "清除中..." : "清除所有"}
              </button>
            )}

            <button
              onClick={handleApplySearch}
              disabled={isFilterBusy}
              className="w-12 h-12 shrink-0 rounded-full bg-[#2f9e6d] flex items-center justify-center transition-colors shadow-md ml-2 mr-2 hover:bg-[#267a56] disabled:opacity-60"
            >
              {isFilterBusy ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Search Bar (hidden on desktop) */}
          <div className="flex md:hidden items-center gap-3 mb-4">
            <div className="flex-1 flex items-center bg-white rounded-2xl px-4 py-3.5 border border-[rgba(31,41,51,0.08)] shadow-sm">
              <svg
                className="w-5 h-5 text-[#1f2933] mr-2 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35"
                />
              </svg>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplySearch()}
                placeholder={
                  activeTab === "item" ? "搜索物品名称..." : "搜索转租..."
                }
                className="w-full bg-transparent outline-none text-[#1f2933] placeholder-[#5a6b73] text-[15px]"
              />
              {keyword && (
                <button
                  onClick={handleClearKeyword}
                  className="w-5 h-5 shrink-0 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300 ml-2 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowMobileFilter(true)}
              className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-white border border-[rgba(31,41,51,0.08)] shadow-sm"
            >
              <svg
                className="w-5 h-5 text-[#1f2933]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Removed Desktop Filter Chips to use the sliding Modal exclusively */}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#f3fbf7]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 pb-12">
          {/* Unified Listing Section */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-[#1f2933]">
                {appliedLocation !== "全部城市"
                  ? `${formatCityLabel(appliedLocation)} · ${activeTab === "item" ? "在售闲置" : "招租房源"}`
                  : activeTab === "item"
                    ? "正在出售"
                    : "正在招租"}
              </h2>
              <div className="text-sm font-medium text-[#5a6b73]">
                共 {activeListings.length} 条结果
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${showResultsBusy ? "loading" : "ready"}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: DURATION.fast, ease: EASE.out }}
                className="relative min-h-[280px]"
              >
                {showResultsBusy ? (
                  <PageLoading
                    label={isFilterBusy ? "正在更新结果..." : "加载中..."}
                  />
                ) : activeListings.length > 0 ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-8">
                    {activeListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : baseListings.length === 0 ? (
                  <EmptyState
                    emoji={activeTab === "item" ? "📦" : "🏠"}
                    title={
                      activeTab === "item" ? "还没有在售闲置" : "还没有招租房源"
                    }
                    description={
                      activeTab === "item"
                        ? "成为第一个发布闲置的人，让好物找到新主人"
                        : "暂无发布房源"
                    }
                  />
                ) : (
                  <EmptyState
                    emoji="🔍"
                    title="没有找到符合条件的商品"
                    description="试试调整筛选条件，或清除筛选查看全部结果"
                    action={
                      hasAppliedFilters ? (
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          disabled={isFilterBusy}
                          className="inline-flex items-center gap-2 text-[#2f9e6d] hover:text-[#267a56] font-bold text-[14px] disabled:opacity-60"
                        >
                          {isFilterBusy && <LoadingSpinner size="sm" />}
                          清除筛选条件
                        </button>
                      ) : undefined
                    }
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>

      <MobileFilterModal
        isOpen={showMobileFilter}
        onClose={() => setShowMobileFilter(false)}
        onApplySearch={handleApplySearch}
        onClearFilters={handleClearFilters}
        isFilterBusy={isFilterBusy}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        itemLocation={itemLocation}
        setItemLocation={setItemLocation}
        subletLocation={subletLocation}
        setSubletLocation={setSubletLocation}
        itemLocationOptions={itemLocationOptions}
        subletLocationOptions={subletLocationOptions}
        subletTerm={subletTerm}
        setSubletTerm={setSubletTerm}
        roomType={roomType}
        setRoomType={setRoomType}
        renewable={renewable}
        setRenewable={setRenewable}
        itemCategory={itemCategory}
        setItemCategory={setItemCategory}
      />
    </div>
  );
}
