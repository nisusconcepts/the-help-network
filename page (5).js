"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { matchesZip } from "@/lib/zip";
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

export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <BrowseResults />
    </Suspense>
  );
}

function BrowseResults() {
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("category") || "all";
  const zip = searchParams.get("zip") || "";

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState("");
  const [zipInput, setZipInput] = useState(zip);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setZipInput(zip);
  }, [zip]);

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
      if (!matchesZip(r, zip)) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.area?.toLowerCase().includes(q)
      );
    });
  }, [resources, activeCat, zip, query]);

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
        <form
          action="/browse"
          method="GET"
          style={{ display: "flex", gap: 8, flex: "1 1 220px" }}
          onSubmit={(e) => {
            // Preserve the category filter when the ZIP box is resubmitted.
            if (activeCat !== "all") {
              const hidden = document.createElement("input");
              hidden.type = "hidden";
              hidden.name = "category";
              hidden.value = activeCat;
              e.currentTarget.appendChild(hidden);
            }
          }}
        >
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
            <a href={activeCat !== "all" ? `/browse?category=${activeCat}` : "/browse"} className="btn" style={{ background: "transparent", border: "1px solid var(--line)", flex: "none" }}>
              Clear ZIP
            </a>
          )}
        </form>
      </div>

      {zip && (
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
          Showing resources located in {zip}, plus phone/text lines and statewide services that aren&apos;t tied to one address.
        </p>
      )}

      {loadError && (
        <div className="form-msg err" style={{ marginBottom: 16 }}>
          Couldn&apos;t load the directory: {loadError}. Double-check your Supabase env vars in .env.local.
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <ResourceMap resources={filtered} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 28, alignItems: "start" }}>
        <CategoryRail />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {!loading && filtered.length === 0 && (
            <div className="empty">
              {zip
                ? `No resources found in ${zip} yet. Try a nearby ZIP, or use "Add a Resource" to add one.`
                : 'No resources match yet. Try a different search, or use "Add a Resource" to add one.'}
            </div>
          )}
          {filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} onSelect={setSelectedId} />
          ))}
        </div>
      </div>
    </div>
  );
}
