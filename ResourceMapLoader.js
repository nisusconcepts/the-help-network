"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

// Compact category switcher for the /browse results page. Deliberately no
// counts (a number here would just go stale as listings change) and no
// dropdown/local state — every item is a real link, so clicking one is a
// normal page navigation that keeps the current ZIP filter intact.
export default function CategoryRail() {
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("category") || "all";
  const zip = searchParams.get("zip");

  function hrefFor(slug) {
    const params = new URLSearchParams();
    if (slug !== "all") params.set("category", slug);
    if (zip) params.set("zip", zip);
    const qs = params.toString();
    return qs ? `/browse?${qs}` : "/browse";
  }

  return (
    <div style={{ position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 2 }}>
      <RailLink href={hrefFor("all")} label="All resources" active={activeCat === "all"} color="#1f5f5b" />
      {CATEGORIES.map((c) => (
        <RailLink key={c.slug} href={hrefFor(c.slug)} label={c.label} active={activeCat === c.slug} color={c.color} />
      ))}
    </div>
  );
}

function RailLink({ href, label, active, color }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        textAlign: "left",
        textDecoration: "none",
        background: active ? "var(--panel)" : "transparent",
        padding: "8px 10px",
        borderRadius: 7,
        color: active ? "var(--ink)" : "var(--ink-soft)",
        fontWeight: active ? 500 : 400,
        fontSize: 13.5,
        boxShadow: active ? "var(--shadow)" : "none",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", flex: "none", background: color }} />
      {label}
    </Link>
  );
}
