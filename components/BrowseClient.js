"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { matchesZip, ZIP_SEARCH_RADIUS_MILES } from "@/lib/zip";
import CategoryRail from "@/components/CategoryRail";
import ResourceCard from "@/components/ResourceCard";

// ssr:false is only legal inside a Client Component — this file is one
// ("use client" above) precisely so the map can be loaded this way.
const ResourceMap = dynamic(() => import("@/components/ResourceMap"), {
  ssr: false,
  loading: () => (
    <div className="map-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-soft)" }}>
      Loading map…
    </div>
  ),
});

// Shared client logic for both /browse (all categories, query-string
// filtering) and /browse/[category] (one category per URL, for real
// per-category indexing). The server page passes `initialCategory` (from
// the path segment, when present) and `initialResources` (fetched
// server-side, so the first paint already has real listings instead of an
// empty list waiting on a client-side fetch).
export default function BrowseClient({ initialCategory, initialResources = [] }) {
  return (
    <Suspense fallback={null}>
      <BrowseResults initialCategory={initialCategory} initialResources={initialResources} />
    </Suspense>
  );
}

function BrowseResults({ initialCategory, initialResources }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // A path-based category (/browse/crisis) wins by default; ?category= in
  // the query string still works too, so old /browse?category=... links
  // people may have saved or shared keep working.
  const activeCat = searchParams.get("category") || initialCategory || "all";
  const zip = searchParams.get("zip") || "";
  const detoxOnly = searchParams.get("detox") === "1";

  const [resources, setResources] = useState(initialResources);
  const [loading, setLoading] = useState(initialResources.length === 0);
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState("");
  const [zipInput, setZipInput] = useState(zip);
  const [selectedId, setSelectedId] = useState(null);
  const [zipCenter, setZipCenter] = useState(null);
  const [zipLocating, setZipLocating] = useState(false);

  useEffect(() => {
    setZipInput(zip);
  }, [zip]);

  // Turn the searched ZIP into a center point once, so nearby (not just
  // exact-match) resources can be found and pinned on the map.
  useEffect(() => {
    if (!zip) {
      setZipCenter(null);
      return;
    }
    let cancelled = false;
    setZipLocating(true);
    fetch(`/api/geocode?address=${encodeURIComponent(`${zip}, USA`)}`)
      .then((res) => res.json())
      .then((coords) => {
        if (cancelled) return;
        setZipCenter(coords && typeof coords.lat === "number" ? coords : null);
      })
      .catch(() => {
        if (!cancelled) setZipCenter(null);
      })
      .finally(() => {
        if (!cancelled) setZipLocating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [zip]);

  // Re-fetch on mount to stay fresh even though `resources` may already be
  // seeded from the server-rendered initial list.
  useEffect(() => {
    let cancelled = false;

    supabase
      .from("resources")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setLoadError(error.message);
        } else {
          setResources(data || []);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (activeCat !== "all" && r.category !== activeCat) return false;
      if (detoxOnly && !r.offers_detox) return false;
      if (!matchesZip(r, zip, zipCenter)) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.area?.toLowerCase().includes(q)
      );
    });
  }, [resources, activeCat, detoxOnly, zip, zipCenter, query]);

  const basePath = activeCat !== "all" ? `/browse/${activeCat}` : "/browse";

  // Detox is a real, non-obvious need buried inside "Substance Abuse &
  // Recovery" — some of those listings offer it, most don't, and there's no
  // separate category for it (it's a service a recovery org offers, not a
  // distinct type of org). This toggle is how someone finds "who actually
  // does detox" without reading every card's description.
  function toggleDetoxOnly() {
    const params = new URLSearchParams(searchParams.toString());
    // Category now lives in the path (basePath), not the query string.
    params.delete("category");
    if (detoxOnly) {
      params.delete("detox");
    } else {
      params.set("detox", "1");
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder="Search by name, service, or need…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: "2 1 220px", minWidth: 200 }}
        />
        <form action={basePath} method="GET" style={{ display: "flex", gap: 8, flex: "1 1 220px" }}>
          <input
            name="zip"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            placeholder="ZIP code"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
            style={{ flex: 1, minWidth: 120 }}
          />
          <button className="btn" style={{ background: "var(--panel)", border: "1px solid var(--line)", flex: "none" }} type="submit">
            {zip ? "Update" : "Go"}
          </button>
          {zip && (
            <a href={basePath} className="btn" style={{ background: "transparent", border: "1px solid var(--line)", flex: "none" }}>
              Clear ZIP
            </a>
          )}
        </form>
      </div>

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          fontSize: 13.5,
          color: "var(--ink-soft)",
          marginBottom: 16,
          cursor: "pointer",
        }}
      >
        <input type="checkbox" checked={detoxOnly} onChange={toggleDetoxOnly} />
        Only show places that offer detox
      </label>

      {zip && (
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
          {zipLocating
            ? `Locating ${zip}…`
            : zipCenter
            ? `Showing resources within ${ZIP_SEARCH_RADIUS_MILES} miles of ${zip}, plus phone/text lines and statewide services that aren't tied to one address.`
            : `Showing resources located in ${zip}, plus phone/text lines and statewide services that aren't tied to one address.`}
        </p>
      )}

      {loadError && (
        <div className="form-msg err" style={{ marginBottom: 16 }}>
          Couldn&apos;t load the directory: {loadError}. Double-check your Supabase env vars in .env.local.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 28, alignItems: "start", marginBottom: 28 }}>
        <CategoryRail activeCategory={activeCat} zip={zip} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {!loading && filtered.length === 0 && (
            <div className="empty">
              {detoxOnly
                ? 'No detox-offering listings match your other filters yet. Try clearing the ZIP or category filter.'
                : zip
                ? `No resources found in ${zip} yet. Try a nearby ZIP, or use "Add a Resource" to add one.`
                : 'No resources match yet. Try a different search, or use "Add a Resource" to add one.'}
            </div>
          )}
          {filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} onSelect={setSelectedId} />
          ))}
        </div>
      </div>

      <h3 style={{ fontSize: 15, marginBottom: 10, color: "var(--ink-soft)" }}>Map view</h3>
      <ResourceMap resources={filtered} selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  );
}
