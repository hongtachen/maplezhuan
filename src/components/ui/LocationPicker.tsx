"use client";

import dynamic from "next/dynamic";
import { LocationData } from "./MapComponent";

const MapComponentDynamic = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[240px] rounded-[16px] bg-[#f7f9fc] border border-gray-200 animate-pulse flex items-center justify-center">
      <span className="text-[#5a6b73] text-sm font-medium">加载地图中...</span>
    </div>
  ),
});

interface LocationPickerProps {
  value?: LocationData;
  onChange?: (data: LocationData) => void;
  readOnly?: boolean;
  mapClassName?: string;
}

export type { LocationData };
export default function LocationPicker({
  value,
  onChange,
  readOnly,
  mapClassName,
}: LocationPickerProps) {
  return (
    <MapComponentDynamic
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={mapClassName}
    />
  );
}
