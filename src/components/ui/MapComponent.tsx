"use client";

import { useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export interface LocationData {
  lat: number;
  lng: number;
  text: string;
  showExactLocation: boolean;
  city?: string;
}

interface MapComponentProps {
  value?: LocationData;
  onChange?: (data: LocationData) => void;
  readOnly?: boolean;
  className?: string;
}

// Default to Toronto
const DEFAULT_CENTER: [number, number] = [43.65107, -79.347015];

// Helper to pan map
function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
  };
}

function MapClickHandler({
  onMapClick,
  readOnly,
}: {
  onMapClick: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (readOnly) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapComponent({
  value,
  onChange,
  readOnly,
  className,
}: MapComponentProps) {
  // Fully controlled: all position/address state lives in the parent via `value`.
  // Local state is only for UI-only concerns: loading indicator and search.
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derive display values directly from the controlled `value` prop.
  const position = value ? { lat: value.lat, lng: value.lng } : null;
  const addressText = value?.text ?? "点击地图选择位置...";
  const cityValue = value?.city ?? "";
  const showExactLocation = value?.showExactLocation ?? true;

  const handleUpdate = (
    lat: number,
    lng: number,
    text: string,
    exact: boolean,
    city: string = cityValue,
  ) => {
    onChange?.({ lat, lng, text, showExactLocation: exact, city });
  };

  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoading(true);
    onChange?.({
      lat,
      lng,
      text: "正在获取地址信息...",
      showExactLocation,
      city: cityValue,
    });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8" } },
      );
      const data = await res.json();

      let newText = data.display_name;
      let newCity = "";
      if (data.address) {
        const { road, suburb, city, town, state } = data.address;
        newCity = city || town || "";
        const parts = [road, suburb, newCity, state].filter(Boolean);
        if (parts.length > 0) newText = parts.join(", ");
      }
      handleUpdate(lat, lng, newText, showExactLocation, newCity);
    } catch {
      handleUpdate(
        lat,
        lng,
        "无法获取地址详情，请重试",
        showExactLocation,
        cityValue,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    fetchAddress(lat, lng);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
          { headers: { "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8" } },
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectSearchResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newCity =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      "";
    const text = result.display_name.split(",").slice(0, 3).join(",");
    setSearchQuery("");
    setSearchResults([]);
    handleUpdate(lat, lng, text, showExactLocation, newCity);
  };

  return (
    <div
      className={`flex flex-col gap-3 w-full relative z-0 ${className || ""}`}
    >
      {/* Search Bar */}
      {!readOnly && onChange && (
        <div className="relative z-[1001]">
          <div className="relative flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:border-[#2f9e6d] focus-within:ring-1 focus-within:ring-[#2f9e6d] transition-all">
            <span className="pl-3 pr-2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索街道、地标、城市..."
              className="w-full py-3 pr-4 text-[14px] outline-none"
            />
            {isSearching && (
              <div className="absolute right-3 w-4 h-4 border-2 border-[#2f9e6d] border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[1002] max-h-[250px] overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-4 py-3 hover:bg-[#f3fbf7] border-b last:border-0 border-gray-50 transition-colors flex items-start gap-2"
                >
                  <span className="text-gray-400 mt-0.5 shrink-0">📍</span>
                  <span className="text-[13px] text-[#1f2933] line-clamp-2">
                    {res.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div
        className={`relative w-full ${className || "h-[240px]"} rounded-[16px] overflow-hidden border border-gray-200 shadow-sm z-0`}
      >
        <MapContainer
          center={position ? [position.lat, position.lng] : DEFAULT_CENTER}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {position && showExactLocation && (
            <Marker position={[position.lat, position.lng]} />
          )}
          {position && !showExactLocation && (
            <Circle
              center={[position.lat, position.lng]}
              radius={500}
              pathOptions={{
                fillColor: "#2f9e6d",
                color: "#2f9e6d",
                weight: 2,
                fillOpacity: 0.2,
              }}
            />
          )}

          {!readOnly && !onChange && !position && (
            <Marker position={DEFAULT_CENTER} />
          )}

          <MapClickHandler
            onMapClick={handleMapClick}
            readOnly={readOnly || !onChange}
          />
          {position && <MapUpdater center={[position.lat, position.lng]} />}
        </MapContainer>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-[1000]">
            <div className="w-8 h-8 border-4 border-[#2f9e6d] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Address & Privacy Controls */}
      {!readOnly && onChange && (
        <div className="flex flex-col gap-3 bg-[#f7f9fc] rounded-[16px] p-4 border border-transparent">
          <div className="flex items-start gap-2">
            <span className="text-xl shrink-0 mt-0.5 grayscale opacity-70">
              📍
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-medium text-[#1f2933] line-clamp-2 leading-snug">
                {addressText}
              </p>
              <p className="text-[11px] text-[#5a6b73] mt-1">
                {position
                  ? "您可以通过搜索或点击地图修改位置，并滑动滚轮缩放地图"
                  : "请在上方搜索或点击地图选取您的位置"}
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-gray-200/60 my-1"></div>

          {/* Exact vs Approx Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col pr-4">
              <span className="text-[13px] font-bold text-[#1f2933]">
                向买家展示精确位置
              </span>
              <span className="text-[11px] text-[#5a6b73] leading-relaxed mt-1">
                {showExactLocation
                  ? "精确位置将在买家确认购买/预订后才会显示，普通访客仅能看到所在区域。您可随时在设置中修改。"
                  : "所有买家均只能看到您所在的大致区域 (半径500米)。您可随时在设置中修改。"}
              </span>
            </div>

            <label className="relative shrink-0 flex items-center justify-center w-12 h-7 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors duration-300">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showExactLocation}
                onChange={(e) => {
                  const val = e.target.checked;
                  if (position)
                    handleUpdate(position.lat, position.lng, addressText, val);
                }}
              />
              <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-300 ease-spring"></div>
              <div className="absolute inset-0 rounded-full bg-[#2f9e6d] opacity-0 peer-checked:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-300 ease-spring z-10"></div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
