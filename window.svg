"use client";

import { useCallback, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { CATEGORY_BY_SLUG } from "@/lib/categories";

// Plain Leaflet (not react-leaflet) driven imperatively via refs — this file
// must only ever be loaded through `next/dynamic(..., { ssr: false })` from
// a Client Component, because Leaflet touches `window`/`document` at import
// time and will throw during any server render.
//
// Tiles come from CARTO's free "Voyager" basemap (built on OpenStreetMap
// data, no API key or billing account needed) — a cleaner, less cluttered
// style than raw OSM tiles. This is the whole reason this app exists outside
// the Artifact sandbox, which blocks loading tiles from any map provider.
// Swap this tile layer for Google Maps later if/when a Maps API key exists.

const DFW_CENTER = [32.85, -97.05];

export default function ResourceMap({ resources, selectedId, onSelect, center, zoom }) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  const renderMarkers = useCallback(
    (L) => {
      const map = mapRef.current;
      if (!map) return;

      Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
      markersRef.current = {};

      const pinned = resources.filter((r) => typeof r.lat === "number" && typeof r.lng === "number");

      pinned.forEach((r) => {
        const cat = CATEGORY_BY_SLUG[r.category];
        const color = cat ? cat.color : "#1f5f5b";
        // Teardrop pin (the shape people expect from any modern map, Google's
        // included) instead of a plain dot — SVG inline so no icon assets
        // are needed.
        const icon = L.divIcon({
          className: "",
          html: `<svg width="26" height="34" viewBox="0 0 26 34" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">
            <path d="M13 0C5.8 0 0 5.8 0 13c0 9.5 13 21 13 21s13-11.5 13-21C26 5.8 20.2 0 13 0z" fill="${color}"/>
            <circle cx="13" cy="13" r="5.5" fill="white"/>
          </svg>`,
          iconSize: [26, 34],
          iconAnchor: [13, 34],
          popupAnchor: [0, -30],
        });
        const marker = L.marker([r.lat, r.lng], { icon }).addTo(map);
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`;
        marker.bindPopup(
          `<div style="min-width:180px">
            <strong>${escapeHtml(r.name)}</strong><br/>
            <span style="color:#4b5b56">${escapeHtml(cat ? cat.label : r.category)}</span>
            ${r.address ? `<br/><span style="color:#4b5b56">${escapeHtml(r.address)}</span>` : ""}
            ${r.phone ? `<br/><a href="tel:${escapeHtml(r.phone.replace(/[^\d+]/g, ""))}">${escapeHtml(r.phone)}</a>` : ""}
            <div style="margin-top:6px;display:flex;gap:10px;font-size:12.5px">
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer">Get directions</a>
              <a href="/resource/${r.id}">Full details</a>
            </div>
          </div>`
        );
        marker.on("click", () => onSelect && onSelect(r.id));
        markersRef.current[r.id] = marker;
      });

      if (pinned.length && !selectedId) {
        const bounds = L.latLngBounds(pinned.map((r) => [r.lat, r.lng]));
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
      }
    },
    [resources, selectedId, onSelect]
  );

  // Create the map once.
  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || mapRef.current) return;

      const map = L.map(mapElRef.current, {
        center: center || DFW_CENTER,
        zoom: zoom || 9,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      mapRef.current = map;
      renderMarkers(L);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render markers whenever the resource list (or selection) changes.
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => renderMarkers(L));
  }, [renderMarkers]);

  // Pan/open popup when a card is selected from outside the map.
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const marker = markersRef.current[selectedId];
    if (marker) {
      mapRef.current.panTo(marker.getLatLng());
      marker.openPopup();
    }
  }, [selectedId]);

  return <div className="map-container" ref={mapElRef} role="img" aria-label="Map of resource locations" />;
}

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}
