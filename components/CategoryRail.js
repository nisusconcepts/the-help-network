import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

// Compact category switcher for the /browse results page. Deliberately no
// counts (a number here would just go stale as listings change) and no
// dropdown/local state — every item is a real link, so clicking one is a
// normal page navigation that keeps the current ZIP filter intact.
// Category links point at path-based routes (/browse/[category]) so each
// category has its own indexable URL and per-page title/description;
// "All resources" stays at /browse. The active category and current ZIP
// come in as props from BrowseClient, since with path-based routing the
// category isn't always in the query string for this component to read
// itself.
export default function CategoryRail({ activeCategory = "all", zip = "" }) {
  function hrefFor(slug) {
    const base = slug === "all" ? "/browse" : `/browse/${slug}`;
    return zip ? `${base}?zip=${zip}` : base;
  }

  return (
    <div style={{ position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 2 }}>
      <RailLink href={hrefFor("all")} label="All resources" active={activeCategory === "all"} color="#1f5f5b" />
      {CATEGORIES.map((c) => (
        <RailLink key={c.slug} href={hrefFor(c.slug)} label={c.label} active={activeCategory === c.slug} color={c.color} />
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
