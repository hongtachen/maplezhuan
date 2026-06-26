"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import Link from "next/link";
import Image from "next/image";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useItems, useSublets } from "@/hooks/useListings";

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

// Custom icon for Items (Shopping Bag)
const itemIcon = L.divIcon({
  html: `<div style="width: 32px; height: 32px; background-color: white; border: 2px solid #2f9e6d; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 6px rgba(0,0,0,0.15); font-size: 16px;">🛍️</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Custom icon for Sublets (House)
const subletIcon = L.divIcon({
  html: `<div style="width: 32px; height: 32px; background-color: white; border: 2px solid #d94a38; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 6px rgba(0,0,0,0.15); font-size: 16px;">🏠</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const DEFAULT_CENTER: [number, number] = [43.65107, -79.347015];

const createClusterCustomIcon = function (cluster: {
  getChildCount: () => number;
}) {
  const count = cluster.getChildCount();
  let sizeClass = "w-10 h-10 text-[14px]";
  if (count >= 10 && count < 30) sizeClass = "w-12 h-12 text-[16px]";
  if (count >= 30) sizeClass = "w-14 h-14 text-[18px]";

  return L.divIcon({
    html: `<div class="map-cluster-custom-icon ${sizeClass}">
             ${count}
           </div>`,
    className: "", // Override default leaflet cluster class
    iconSize: L.point(40, 40, true),
  });
};

/** Generate a stable jitter offset for an id not already in the map. */
function addJitterForNewIds(
  ids: string[],
  prev: Map<string, [number, number]>,
): Map<string, [number, number]> {
  const hasNew = ids.some((id) => !prev.has(id));
  if (!hasNew) return prev;
  const next = new Map(prev);
  for (const id of ids) {
    if (!next.has(id)) {
      next.set(id, [
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002,
      ]);
    }
  }
  return next;
}

export default function GlobalMapComponent({
  className,
}: {
  className?: string;
}) {
  const { items } = useItems("在售");
  const { sublets } = useSublets("招租中");

  // Jitter offsets stored as state (keyed by listing id) so they are stable
  // across re-renders and Math.random is called only in effects, not during render.
  const [itemJitter, setItemJitter] = useState<Map<string, [number, number]>>(
    new Map(),
  );
  const [subletJitter, setSubletJitter] = useState<
    Map<string, [number, number]>
  >(new Map());

  useEffect(() => {
    const ids = items.map((i) => i.id ?? "");
    setTimeout(() => setItemJitter((prev) => addJitterForNewIds(ids, prev)), 0);
  }, [items]);

  useEffect(() => {
    const ids = sublets.map((s) => s.id ?? "");
    setTimeout(
      () => setSubletJitter((prev) => addJitterForNewIds(ids, prev)),
      0,
    );
  }, [sublets]);

  return (
    <div
      className={`relative w-full ${className || "h-[240px]"} rounded-[16px] overflow-hidden border border-gray-200 shadow-sm z-0`}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          iconCreateFunction={createClusterCustomIcon}
        >
          {items.map((item) => {
            if (!item.locationData) return null;
            const pos: [number, number] = [
              item.locationData.lat,
              item.locationData.lng,
            ];
            const isExact = item.locationData.showExactLocation !== false;
            const jitter = itemJitter.get(item.id ?? "") ?? [0, 0];
            const markerPos: [number, number] = isExact
              ? pos
              : [pos[0] + jitter[0], pos[1] + jitter[1]];

            return (
              <Marker
                key={`item-${item.id}`}
                position={markerPos}
                icon={itemIcon}
              >
                <Popup closeButton={false}>
                  <Link
                    href={`/listing/${item.id}`}
                    className="block w-[150px] no-underline hover:opacity-90 transition-opacity p-1"
                  >
                    {item.images?.[0] && (
                      <div className="relative w-full h-[110px] mb-2 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="text-[13px] font-bold line-clamp-2 text-[#1f2933] leading-tight mb-1">
                      {item.title}
                    </div>
                    <div className="text-[#2f9e6d] font-bold text-[15px]">
                      ${item.price}
                    </div>
                  </Link>
                </Popup>
              </Marker>
            );
          })}

          {sublets.map((sublet) => {
            if (!sublet.locationData) return null;
            const pos: [number, number] = [
              sublet.locationData.lat,
              sublet.locationData.lng,
            ];
            const isExact = sublet.locationData.showExactLocation !== false;
            const jitter = subletJitter.get(sublet.id ?? "") ?? [0, 0];
            const markerPos: [number, number] = isExact
              ? pos
              : [pos[0] + jitter[0], pos[1] + jitter[1]];

            return (
              <Marker
                key={`sublet-${sublet.id}`}
                position={markerPos}
                icon={subletIcon}
              >
                <Popup closeButton={false}>
                  <Link
                    href={`/sublet/${sublet.id}`}
                    className="block w-[150px] no-underline hover:opacity-90 transition-opacity p-1"
                  >
                    {sublet.images?.[0] && (
                      <div className="relative w-full h-[110px] mb-2 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={sublet.images[0]}
                          alt={sublet.title ?? ""}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="text-[13px] font-bold line-clamp-2 text-[#1f2933] leading-tight mb-1">
                      {sublet.title}
                    </div>
                    <div className="text-[#d94a38] font-bold text-[15px]">
                      ${sublet.price}/月
                    </div>
                  </Link>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .map-cluster-custom-icon {
          background: linear-gradient(135deg, #2f9e6d 0%, #1a6b47 100%);
          color: white;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(47, 158, 109, 0.4), 0 0 0 4px rgba(47, 158, 109, 0.15);
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
          animation: map-cluster-pulse 2.5s infinite;
        }
        .map-cluster-custom-icon:hover {
          transform: scale(1.15) translateY(-2px);
          box-shadow: 0 6px 16px rgba(47, 158, 109, 0.5), 0 0 0 6px rgba(47, 158, 109, 0.2);
          animation: none;
          z-index: 1000 !important;
        }
        @keyframes map-cluster-pulse {
          0% { box-shadow: 0 4px 12px rgba(47, 158, 109, 0.4), 0 0 0 0 rgba(47, 158, 109, 0.4); }
          70% { box-shadow: 0 4px 12px rgba(47, 158, 109, 0.4), 0 0 0 12px rgba(47, 158, 109, 0); }
          100% { box-shadow: 0 4px 12px rgba(47, 158, 109, 0.4), 0 0 0 0 rgba(47, 158, 109, 0); }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 14px;
          overflow: hidden;
          padding: 0;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .leaflet-popup-content {
          margin: 6px;
        }
        .leaflet-popup-tip {
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
      `,
        }}
      />
    </div>
  );
}
