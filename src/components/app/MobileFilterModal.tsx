"use client";

import {
  ITEM_CATEGORIES,
  SUBLET_ROOM_TYPES,
  SUBLET_LEASE_TERMS,
  SUBLET_RENEWABLE_OPTIONS,
  formatCityLabel,
} from "@/lib/browseFilters";

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySearch: () => void;
  onClearFilters: () => void;
  activeTab: "item" | "sublet";
  setActiveTab: (tab: "item" | "sublet") => void;
  itemLocation: string;
  setItemLocation: (loc: string) => void;
  subletLocation: string;
  setSubletLocation: (loc: string) => void;
  itemLocationOptions: string[];
  subletLocationOptions: string[];
  subletTerm: string;
  setSubletTerm: (term: string) => void;
  roomType: string;
  setRoomType: (rt: string) => void;
  renewable: string;
  setRenewable: (r: string) => void;
  itemCategory: string;
  setItemCategory: (cat: string) => void;
}

export default function MobileFilterModal({
  isOpen,
  onClose,
  onApplySearch,
  onClearFilters,
  activeTab,
  setActiveTab,
  itemLocation,
  setItemLocation,
  subletLocation,
  setSubletLocation,
  itemLocationOptions,
  subletLocationOptions,
  subletTerm,
  setSubletTerm,
  roomType,
  setRoomType,
  renewable,
  setRenewable,
  itemCategory,
  setItemCategory,
}: MobileFilterModalProps) {
  const location = activeTab === "item" ? itemLocation : subletLocation;
  const setLocation =
    activeTab === "item" ? setItemLocation : setSubletLocation;
  const locationOptions =
    activeTab === "item" ? itemLocationOptions : subletLocationOptions;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[199] bg-black/40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[400px] z-[200] bg-white flex flex-col md:hidden transition-transform duration-300 ease-out shadow-[-4px_0_24px_rgba(0,0,0,0.1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(31,41,51,0.08)]">
          <h2 className="text-lg font-bold text-[#1f2933]">筛选</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={onClearFilters}
              className="text-sm font-medium text-[#5a6b73] hover:text-[#1f2933] transition-colors"
            >
              清除全部
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-[#1f2933] transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(31,41,51,0.08)] shrink-0">
          <button
            onClick={() => setActiveTab("item")}
            className={`flex-1 py-4 text-sm text-center relative transition-colors ${
              activeTab === "item"
                ? "font-bold text-[#1f2933]"
                : "font-medium text-[#5a6b73]"
            }`}
          >
            🏷️ 闲置
            {activeTab === "item" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1f2933]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sublet")}
            className={`flex-1 py-4 text-sm text-center relative transition-colors ${
              activeTab === "sublet"
                ? "font-bold text-[#1f2933]"
                : "font-medium text-[#5a6b73]"
            }`}
          >
            🏠 转租
            {activeTab === "sublet" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1f2933]"></div>
            )}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-24">
          {activeTab === "sublet" ? (
            <div className="px-4 py-5 flex flex-col gap-6">
              {/* Location */}
              <div>
                <h3 className="text-sm font-medium text-[#1f2933] mb-3">
                  地点
                </h3>
                <div className="flex flex-wrap gap-2">
                  {locationOptions.length <= 1 ? (
                    <p className="text-sm text-[#5a6b73]">暂无转租城市数据</p>
                  ) : (
                    locationOptions.map((city) => (
                      <button
                        key={city}
                        onClick={() => setLocation(city)}
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

              {/* Term */}
              <div>
                <h3 className="text-sm font-medium text-[#1f2933] mb-3">
                  租期
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SUBLET_LEASE_TERMS.map((term) => (
                    <button
                      key={term}
                      onClick={() => setSubletTerm(term)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                        subletTerm === term
                          ? "bg-[#f3fbf7] border-[#2f9e6d] text-[#2f9e6d] font-semibold"
                          : "border-[rgba(31,41,51,0.15)] text-[#5a6b73] hover:border-[#2f9e6d]"
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Type */}
              <div>
                <h3 className="text-sm font-medium text-[#1f2933] mb-3">
                  房型
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SUBLET_ROOM_TYPES.map((rt) => (
                    <button
                      key={rt.id}
                      onClick={() => setRoomType(rt.id)}
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

              {/* Renewable */}
              <div>
                <h3 className="text-sm font-medium text-[#1f2933] mb-3">
                  是否可续租
                </h3>
                <div className="flex gap-2">
                  {SUBLET_RENEWABLE_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRenewable(r)}
                      className={`flex-1 py-2.5 rounded-full text-sm border transition-colors ${
                        renewable === r
                          ? "bg-[#f3fbf7] border-[#2f9e6d] text-[#2f9e6d] font-semibold"
                          : "border-[rgba(31,41,51,0.15)] text-[#5a6b73] hover:border-[#2f9e6d]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-5 flex flex-col gap-6">
              {/* Item Location */}
              <div>
                <h3 className="text-sm font-medium text-[#1f2933] mb-3">
                  地点
                </h3>
                <div className="flex flex-wrap gap-2">
                  {locationOptions.length <= 1 ? (
                    <p className="text-sm text-[#5a6b73]">暂无闲置城市数据</p>
                  ) : (
                    locationOptions.map((city) => (
                      <button
                        key={city}
                        onClick={() => setLocation(city)}
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

              {/* Category */}
              <div>
                <h3 className="text-sm font-medium text-[#1f2933] mb-3">
                  分类
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {ITEM_CATEGORIES.filter((c) => c.id !== "other").map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setItemCategory(c.id)}
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
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(31,41,51,0.08)] bg-white z-10">
          <button
            onClick={onApplySearch}
            className="w-full py-4 rounded-xl bg-[#1f2933] hover:bg-black text-white font-medium text-base transition-colors"
          >
            搜索
          </button>
        </div>
      </div>
    </>
  );
}
