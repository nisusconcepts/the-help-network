"use client";

import dynamic from "next/dynamic";

// Thin client-component wrapper so a Server Component page (like the
// resource detail page) can still render the map. `ssr:false` can only be
// used inside a Client Component — see components/ResourceMap.js.
const ResourceMap = dynamic(() => import("@/components/ResourceMap"), { ssr: false });

export default function ResourceMapLoader({ resource }) {
  if (typeof resource.lat !== "number" || typeof resource.lng !== "number") return null;
  return <ResourceMap resources={[resource]} center={[resource.lat, resource.lng]} zoom={14} />;
}
