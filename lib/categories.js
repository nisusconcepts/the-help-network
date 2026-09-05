// Single source of truth for category metadata — used by the browse page,
// the submission form, and the seed script. Add a category here once and
// it shows up everywhere.
export const CATEGORIES = [
  { slug: "start-here", label: "Start Here", color: "#1f5f5b", tint: "#e3efed" },
  { slug: "crisis", label: "Crisis & Mental Health", color: "#a8443a", tint: "#f5e0dd" },
  { slug: "recovery", label: "Substance Abuse & Recovery", color: "#8a5a2b", tint: "#f2e4d1" },
  { slug: "domestic-violence", label: "Domestic Violence Support", color: "#8f3a63", tint: "#f2dfe9" },
  { slug: "shelter", label: "Shelter & Housing", color: "#3f5c7a", tint: "#dee6ef" },
  { slug: "sober-living", label: "Sober Living Homes", color: "#4a7373", tint: "#dde9e9" },
  { slug: "lgbtq", label: "LGBTQ+ Support", color: "#6a4a9c", tint: "#e6dff3" },
  { slug: "food", label: "Food Assistance", color: "#3f7057", tint: "#e1ede4" },
  { slug: "clothing", label: "Clothing & Essentials", color: "#c97a2b", tint: "#f7e6d2" },
  { slug: "military-first-responder", label: "Military & First Responder Support", color: "#3d4f66", tint: "#dde3ea" },
  { slug: "support-groups", label: "Support Groups & Peer Recovery", color: "#96751f", tint: "#f2e8cf" },
  { slug: "legal-aid", label: "Legal Aid & Protective Orders", color: "#4a5568", tint: "#e1e4ea" },
  { slug: "financial-assistance", label: "Financial & Utility Assistance", color: "#6b7a3f", tint: "#e8ecdd" },
  { slug: "human-trafficking", label: "Human Trafficking Support", color: "#6b2436", tint: "#ecd9df" },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
