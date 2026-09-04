// Turns a street address into { lat, lng } using OpenStreetMap's free
// Nominatim geocoder. Used by scripts/seed.mjs and by the admin approve
// action so every new listing gets map coordinates automatically —
// nobody should ever have to hand-type latitude/longitude.
//
// Nominatim's usage policy (https://operations.osmfoundation.org/policies/nominatim/)
// caps free use at 1 request/second and requires a real identifying
// User-Agent. callGeocode() below enforces both. If this directory ever
// needs to geocode at real volume (thousands of submissions), switch to a
// paid provider (Mapbox and Google both have geocoding APIs with a free
// tier) — this function's signature can stay the same either way.

let lastCallAt = 0;

export async function geocodeAddress(address) {
  if (!address || !address.trim()) return null;

  // Respect the 1 req/sec limit even if this is called in a tight loop.
  const elapsed = Date.now() - lastCallAt;
  if (elapsed < 1100) {
    await new Promise((r) => setTimeout(r, 1100 - elapsed));
  }
  lastCallAt = Date.now();

  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
      countrycodes: "us",
    });

  const res = await fetch(url, {
    headers: {
      "User-Agent": "TheHelpNetwork/1.0 (community resource directory; contact via project owner)",
    },
  });

  if (!res.ok) {
    throw new Error(`Geocoding request failed (${res.status}) for "${address}"`);
  }

  const results = await res.json();
  if (!results.length) return null;

  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}
