import { supabase } from "@/lib/supabaseClient";

// Server-side initial fetch, used by both /browse and /browse/[category] so
// the very first HTML response already contains real listings — a crawler
// or link-unfurler that doesn't execute JS (or bails before the client's
// own re-fetch finishes) sees actual resource content instead of an empty
// shell. The client re-fetches on mount afterward to stay fresh; this is
// only responsible for what ships in the initial render.
export async function getInitialResources() {
  try {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      console.error("getInitialResources:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("getInitialResources:", err.message);
    return [];
  }
}

