"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: "user" | "rider" | "destination";
}

interface MapViewProps {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
}

const MARKER_COLOR: Record<MapMarker["type"], string> = {
  user: "#22c55e",
  rider: "#facc15",
  destination: "#ef4444",
};

export default function MapView({ center, zoom, markers }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("NEXT_PUBLIC_MAPBOX_TOKEN is not set — map will not render");
      return;
    }
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center,
      zoom,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter when the caller passes a new center/zoom (e.g. geolocation resolves).
  useEffect(() => {
    mapRef.current?.easeTo({ center, zoom, duration: 500 });
  }, [center, zoom]);

  // Keep markers in sync with `markers`.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const current = markersRef.current;
    const seen = new Set<string>();

    for (const marker of markers) {
      seen.add(marker.id);
      let mbMarker = current.get(marker.id);
      if (!mbMarker) {
        const el = document.createElement("div");
        el.style.width = "16px";
        el.style.height = "16px";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid #0f172a";
        el.style.background = MARKER_COLOR[marker.type];
        el.style.boxShadow = "0 0 0 2px rgba(255,255,255,0.15)";
        mbMarker = new mapboxgl.Marker({ element: el }).setLngLat([marker.lng, marker.lat]);
        mbMarker.addTo(map);
        current.set(marker.id, mbMarker);
      } else {
        mbMarker.setLngLat([marker.lng, marker.lat]);
      }
    }

    current.forEach((mbMarker, id) => {
      if (!seen.has(id)) {
        mbMarker.remove();
        current.delete(id);
      }
    });
  }, [markers]);

  return <div ref={containerRef} className="w-full h-full" />;
}
