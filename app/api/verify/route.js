// Server-side "does this match what the organization's own website says"
// check. This is the free, rule-based verification bot: it fetches the
// website a submitter or admin provided, strips it down to plain text, and
// looks for the phone number and address the form says to compare against.
// It also pulls out any phone-number-shaped strings it finds on the page,
// so an admin isn't fully dependent on whatever the visitor typed in — if
// the submitter left a field blank or got it wrong, the page itself can
// fill the gap.
//
// This intentionally does NOT call any AI model — it's plain string
// matching against the fetched HTML, so it costs nothing and needs no API
// key. That also means it's a heuristic, not a guarantee: a match is a good
// sign, a non-match just means "couldn't confirm automatically," not "this
// is wrong." An admin still makes the final call before marking something
// Verified.

const FETCH_TIMEOUT_MS = 8000;
const PHONE_PATTERN = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;

export async function POST(request) {
  const { website, phone, address } = await request.json();
  return handle({ website, phone, address });
}

async function handle({ website, phone, address }) {
  if (!website || !website.trim()) {
    return Response.json({ fetched: false, reason: "no_website" });
  }

  let url = website.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  let text;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ResloResourceBot/1.0; +https://the-help-network-nisus-concepts.vercel.app)",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return Response.json({ fetched: false, reason: "http_error", status: res.status });
    }
    const html = await res.text();
    text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  } catch (err) {
    return Response.json({ fetched: false, reason: "fetch_failed", error: err.message });
  }

  const pageDigits = text.replace(/\D/g, "");
  const collapsedText = text.replace(/\s+/g, " ");

  // Phone: compare the last 10 digits of whatever was submitted against the
  // page's digit stream, so formatting differences ("(682) 464-3150" vs.
  // "682-464-3150" vs. "6824643150") don't cause a false mismatch.
  let phoneMatch = null;
  if (phone && phone.trim()) {
    const submittedDigits = phone.replace(/\D/g, "").slice(-10);
    phoneMatch = submittedDigits.length === 10 && pageDigits.includes(submittedDigits);
  }

  // Address: a full-string match is too brittle (formatting, abbreviations,
  // suite numbers). Instead check for two independent signals — the leading
  // street number and the ZIP code — both showing up somewhere on the page.
  let addressMatch = null;
  if (address && address.trim()) {
    const streetNumberMatch = address.match(/^\s*(\d+)/);
    const zipMatch = address.match(/\b(\d{5})(-\d{4})?\b/);
    const streetNumber = streetNumberMatch ? streetNumberMatch[1] : null;
    const zip = zipMatch ? zipMatch[1] : null;

    const streetNumberFound = streetNumber ? pageDigits.includes(streetNumber) : null;
    const zipFound = zip ? pageDigits.includes(zip) : null;

    if (streetNumberFound === null && zipFound === null) {
      addressMatch = null; // couldn't extract anything to check
    } else {
      addressMatch = Boolean(streetNumberFound) || Boolean(zipFound);
    }
  }

  // Best-effort phone candidates pulled straight from the page, for filling
  // in a blank field or double-checking one that looks off.
  const phoneCandidates = Array.from(new Set((collapsedText.match(PHONE_PATTERN) || []).map((s) => s.trim()))).slice(
    0,
    5
  );

  return Response.json({
    fetched: true,
    phoneMatch,
    addressMatch,
    phoneCandidates,
  });
}
