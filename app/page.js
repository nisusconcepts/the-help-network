import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import AdBanner from "@/components/AdBanner";

// Server Component, no client JS needed: the ZIP box is a plain GET form
// and the category tiles are plain links — both just navigate to /browse
// with a query param. Keeping this page this simple is the point: it's a
// menu, not a filtered list, so there's nothing here that goes stale
// (no resource counts, no in-place filtering).
export default function HomePage() {
  return (
    <div>
      <AdBanner />

      <form
        action="/browse"
        method="GET"
        className="panel-block"
        style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 28 }}
      >
        <div className="field" style={{ flex: "1 1 220px", marginBottom: 0 }}>
          <label htmlFor="zip">Find resources near you</label>
          <input
            id="zip"
            name="zip"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            placeholder="Enter your ZIP code"
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Search by ZIP
        </button>
      </form>

      <h2 style={{ fontSize: 18, marginBottom: 14 }}>Browse by category</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {CATEGORIES.map((c) => (
          <CategoryTile key={c.slug} slug={c.slug} label={c.label} color={c.color} tint={c.tint} />
        ))}
      </div>

      <p style={{ fontSize: 13.5 }}>
        <Link href="/browse">See every listing at once &rarr;</Link>
      </p>
    </div>
  );
}

function CategoryTile({ slug, label, color, tint }) {
  return (
    <Link
      href={`/browse/${slug}`}
      className="panel-block"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "18px 20px",
        textDecoration: "none",
        color: "var(--ink)",
        transition: "transform 0.1s ease",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          flex: "none",
          background: tint,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {label.charAt(0)}
      </span>
      <span style={{ fontWeight: 500, fontSize: 15 }}>{label}</span>
    </Link>
  );
}
