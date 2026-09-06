import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

// Simple, universally-rendered category glyphs — avoids adding an icon
// library dependency for a homepage that's otherwise plain HTML/CSS. Keep
// this in sync with lib/categories.js if a category slug changes.
const CATEGORY_ICONS = {
  all: "🔎",
  "start-here": "🧭",
  crisis: "🆘",
  recovery: "🌱",
  "domestic-violence": "🛡️",
  shelter: "🏠",
  "sober-living": "🛏️",
  lgbtq: "🏳️‍🌈",
  food: "🍽️",
  clothing: "👕",
  "military-first-responder": "🎖️",
  "support-groups": "🤝",
  "legal-aid": "⚖️",
  "financial-assistance": "💵",
  "human-trafficking": "🕊️",
};

// Server Component: the homepage is just the category nav — a grid of
// same-size, icon-labeled tiles. Each links straight to its own
// /browse/[category] page; "All Resources" goes to /browse. Search, ZIP
// filtering, and the map all live one click away on the browse page, so
// this page stays a fast menu with nothing that goes stale (no resource
// counts, no in-place filtering).
export default function HomePage() {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: "32px 28px 36px",
        background:
          "radial-gradient(circle at 12% 15%, var(--teal-tint), transparent 55%), " +
          "radial-gradient(circle at 88% 12%, var(--amber-tint), transparent 50%), " +
          "radial-gradient(circle at 50% 100%, var(--sage-tint), transparent 55%), " +
          "var(--panel)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow)",
      }}
    >
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>Find help by category</h2>
      <p style={{ color: "var(--ink-soft)", fontSize: 14.5, maxWidth: "56ch", margin: "0 0 24px" }}>
        Pick a category below, or browse everything at once — search and ZIP filtering are on the next page.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 14,
        }}
      >
        <CategoryTile href="/browse" icon={CATEGORY_ICONS.all} label="All Resources" color="var(--ink)" tint="var(--panel)" />
        {CATEGORIES.map((c) => (
          <CategoryTile
            key={c.slug}
            href={`/browse/${c.slug}`}
            icon={CATEGORY_ICONS[c.slug]}
            label={c.label}
            color={c.color}
            tint={c.tint}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryTile({ href, icon, label, color, tint }) {
  return (
    <Link
      href={href}
      className="category-tab"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 112,
        padding: "18px 10px",
        borderRadius: 14,
        textDecoration: "none",
        textAlign: "center",
        color,
        background: tint,
        border: `1px solid ${color}`,
        boxShadow: "var(--shadow)",
      }}
    >
      <span style={{ fontSize: 26, lineHeight: 1 }} aria-hidden="true">
        {icon}
      </span>
      <span style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.25 }}>{label}</span>
    </Link>
  );
}
