import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

// Server Component: the homepage is now just the category nav — a row of
// colored, clickable tabs. Each one links straight to its own
// /browse/[category] page; "All Resources" goes to /browse. Search, ZIP
// filtering, and the map all live one click away on the browse page, so
// this page stays a fast menu with nothing that goes stale (no resource
// counts, no in-place filtering).
export default function HomePage() {
  return (
    <div>
      <div
        className="panel-block"
        style={{
          background: "linear-gradient(135deg, var(--teal-tint), var(--panel))",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Find help by category</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14.5, maxWidth: "56ch", margin: 0 }}>
          Pick a category below, or browse everything at once — search and ZIP filtering are on the next page.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <CategoryTab href="/browse" label="All Resources" color="var(--ink)" tint="var(--panel)" />
        {CATEGORIES.map((c) => (
          <CategoryTab key={c.slug} href={`/browse/${c.slug}`} label={c.label} color={c.color} tint={c.tint} />
        ))}
      </div>
    </div>
  );
}

function CategoryTab({ href, label, color, tint }) {
  return (
    <Link
      href={href}
      className="category-tab"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "12px 20px",
        borderRadius: 999,
        textDecoration: "none",
        fontWeight: 600,
        fontSize: 14.5,
        color,
        background: tint,
        border: `1px solid ${color}`,
        boxShadow: "var(--shadow)",
      }}
    >
      {label}
    </Link>
  );
}
