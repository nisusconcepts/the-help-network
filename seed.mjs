// Loads data/dfw-resources.json, geocodes every address that has one, and
// upserts the results into the `resources` table. Safe to re-run — it
// upserts on the `slug` column, so running it again just refreshes the data
// instead of creating duplicates.
//
// Usage:
//   1. Fill in .env.local (see .env.local.example) including
//      SUPABASE_SERVICE_ROLE_KEY (Project Settings > API > service_role —
//      this key bypasses Row Level Security, which is exactly why it's only
//      ever used here, server-side, and never shipped to the browser).
//   2. npm run seed

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { geocodeAddress } from "../lib/geocode.js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.local.example to .env.local and fill both in before running the seed script."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const raw = await readFile(new URL("../data/dfw-resources.json", import.meta.url), "utf-8");
  const resources = JSON.parse(raw);

  console.log(`Seeding ${resources.length} resources...`);

  for (const r of resources) {
    let lat = null;
    let lng = null;

    if (r.address) {
      try {
        const coords = await geocodeAddress(r.address);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          console.log(`  geocoded ${r.name} -> ${lat}, ${lng}`);
        } else {
          console.warn(`  could not geocode "${r.address}" for ${r.name} — leaving lat/lng empty`);
        }
      } catch (err) {
        console.warn(`  geocoding error for ${r.name}: ${err.message}`);
      }
    }

    const { error } = await supabase.from("resources").upsert(
      {
        slug: r.slug,
        name: r.name,
        category: r.category,
        description: r.description,
        phone: r.phone || "",
        address: r.address || "",
        area: r.area || "",
        lat,
        lng,
        hours: r.hours || "",
        requirements: r.requirements || "",
        website: r.website || "",
        hours_247: !!r.hours247,
        free: !!r.free,
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`  FAILED to upsert ${r.name}:`, error.message);
    }
  }

  console.log("Done.");
}

main();
