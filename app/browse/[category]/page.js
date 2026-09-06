import { notFound } from "next/navigation";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/categories";
import { getInitialResources } from "@/lib/resources";
import BrowseClient from "@/components/BrowseClient";

const SITE_URL = "https://the-help-network-nisus-concepts.vercel.app";

// Prerender every real category slug at build time so each one is a real,
// independently indexable page — this is the point of splitting these out
// of the old /browse?category=... query-string version.
export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

// An unknown slug just renders without special metadata; the page itself
// calls notFound() below.
export async function generateMetadata({ params }) {
  const { category } = await params;
  const cat = CATEGORY_BY_SLUG[category];
  if (!cat) return {};

  const title = `${cat.label} — The Help Haven Network`;
  const description = `Find ${cat.label.toLowerCase()} resources near you, reviewed before listing. Part of The Help Haven Network's free directory of mental health, recovery, shelter, and support resources.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/browse/${category}` },
    openGraph: { title, description, url: `${SITE_URL}/browse/${category}` },
    twitter: { title, description },
  };
}

export default async function CategoryBrowsePage({ params }) {
  const { category } = await params;
  if (!CATEGORY_BY_SLUG[category]) notFound();

  const initialResources = await getInitialResources();

  return <BrowseClient initialCategory={category} initialResources={initialResources} />;
}

