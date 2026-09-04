// Pulls a 5-digit US ZIP code out of a free-text street address, e.g.
// "5300 University Hills Blvd, Dallas, TX 75241" -> "75241". Used both to
// backfill existing listings and to auto-tag new resources when an admin
// approves a submission, so nobody has to type a ZIP by hand.
export function extractZip(address) {
  if (!address) return "";
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : "";
}

// Does a resource belong to a given ZIP search? Resources with no street
// address (national hotlines, or a confidential shelter location) aren't
// tied to one place, so they always match — a 24/7 crisis line is just as
// reachable from any ZIP.
export function matchesZip(resource, zip) {
  if (!zip) return true;
  if (!resource.address) return true;
  return resource.zip === zip;
}
