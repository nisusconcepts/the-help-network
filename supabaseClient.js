import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't crash the build if env vars are missing (e.g. during local setup) —
  // just make it obvious at runtime instead of failing silently.
  console.warn(
    "Supabase env vars are missing. Copy .env.local.example to .env.local and fill in your project's URL and anon key."
  );
}

// Browser/client-safe client — uses the public anon key, which is safe to
// expose because every table it can touch is protected by Row Level
// Security policies (see supabase/schema.sql). Never put the service_role
// key in this file or anywhere that ships to the browser.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
