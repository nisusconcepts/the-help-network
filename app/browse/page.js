import BrowseClient from "@/components/BrowseClient";
import { getInitialResources } from "@/lib/resources";

// Server Component: fetches the full resource list before the page ever
// reaches the browser, so the "all categories" browse view has real
// listings in its initial HTML (not just after a client-side fetch
// resolves). Per-category pages live at /browse/[category].
export default async function BrowsePage() {
  const initialResources = await getInitialResources();
  return <BrowseClient initialResources={initialResources} />;
}
