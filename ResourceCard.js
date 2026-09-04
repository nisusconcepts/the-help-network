import { geocodeAddress } from "@/lib/geocode";

// Server-side geocoding endpoint. Geocoding has to happen server-side (not
// straight from the browser) because Nominatim's usage policy asks for a
// real identifying User-Agent header, and browsers refuse to let JS set
// that header — only a server request can send it properly. Used by the
// admin review queue when approving a submission with an address.
export async function POST(request) {
  const { address } = await request.json();
  return handle(address);
}

// GET variant (address as a query param) — exists so this route can be
// called from a plain link/fetch-only context (no custom method/body),
// e.g. for one-off backfills. Same underlying logic as POST.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  return handle(searchParams.get("address"));
}

async function handle(address) {
  if (!address || !address.trim()) {
    return Response.json({ lat: null, lng: null });
  }

  try {
    const coords = await geocodeAddress(address);
    return Response.json(coords || { lat: null, lng: null });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
