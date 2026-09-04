// Pulls a 5-digit US ZIP code out of a free-text street address, e.g.
// "5300 University Hills Blvd, Dallas, TX 75241" -> "75241". Used both to
// backfill existing listings and to auto-tag new resources when an admin
// approves a submission, so nobody has to type a ZIP by hand.
export function extractZip(address) {
  if (!address) return "";
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : "";
}

// Great-circle distance between two lat/lng points, in miles.
export function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth's radius, miles
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// DFW is sprawling and ZIPs are small — exact-ZIP-only matching means most
// searches come back empty even when a great resource is five minutes away.
// Anything within this radius of the searched ZIP's center counts as a match.
export const ZIP_SEARCH_RADIUS_MILES = 5;

// Does a resource belong to a given ZIP search? Resources with no street
// address (national hotlines, or a confidential shelter location) aren't
// tied to one place, so they always match — a 24/7 crisis line is just as
// reachable from any ZIP. Addressed resources match on exact ZIP, or on
// falling within ZIP_SEARCH_RADIUS_MILES of the searched ZIP's center point
// (zipCenter — the caller geocodes the searched ZIP once and passes it in).
export function matchesZip(resource, zip, zipCenter) {
  if (!zip) return true;
  if (!resource.address) return true;
  if (resource.zip === zip) return true;
  if (!zipCenter || typeof resource.lat !== "number" || typeof resource.lng !== "number") {
    return false;
  }
  return distanceMiles(resource.lat, resource.lng, zipCenter.lat, zipCenter.lng) <= ZIP_SEARCH_RADIUS_MILES;
}

