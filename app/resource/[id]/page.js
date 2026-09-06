import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import ResourceMapLoader from "@/components/ResourceMapLoader";

// Server Component — fetches directly with the public anon key (reads are
// open on `resources` per the RLS policy in supabase/schema.sql), so this
// page works without any client-side JS and is fine for search engines too.
function getServerSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export default async function ResourceDetailPage({ params }) {
  const { id } = await params;
  const supabase = getServerSupabase();

  const { data: resource, error } = await supabase.from("resources").select("*").eq("id", id).single();

  if (error || !resource) {
    notFound();
  }

  const cat = CATEGORY_BY_SLUG[resource.category];

  return (
    <div>
      <p style={{ marginBottom: 16 }}>
        <Link href="/" style={{ fontSize: 13.5 }}>
          &larr; Back to the directory
        </Link>
      </p>

      <div className="panel-block" style={{ maxWidth: 720, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <h2 style={{ fontSize: 26 }}>{resource.name}</h2>
          <span
            className="badge"
            style={{
              borderColor: "transparent",
              background: cat ? cat.tint : "var(--teal-tint)",
              color: cat ? cat.color : "var(--teal-dark)",
              textTransform: "uppercase",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            {cat ? cat.label : resource.category}
          </span>
        </div>

        <p style={{ color: "var(--ink-soft)", marginTop: 10 }}>{resource.description}</p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0" }}>
          {resource.verified && (
            <span className="badge" style={{ background: "var(--sage-tint)", color: "var(--sage)" }} title="Confirmed against the organization's own website">
              ✓ Verified
            </span>
          )}
          {resource.hours_247 && <span className="badge urgent">24/7</span>}
          {resource.free && <span className="badge free">Free</span>}
          {resource.area && <span className="badge">{resource.area}</span>}
        </div>

        <dl style={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 8, marginTop: 16, fontSize: 14 }}>
          {resource.phone && (
            <>
              <dt style={{ color: "var(--ink-soft)" }}>Call</dt>
              <dd style={{ margin: 0 }}>
                <a className="mono" href={`tel:${resource.phone.replace(/[^\d+]/g, "")}`}>
                  {resource.phone}
                </a>
              </dd>
            </>
          )}
          {resource.address && (
            <>
              <dt style={{ color: "var(--ink-soft)" }}>Address</dt>
              <dd style={{ margin: 0 }}>{resource.address}</dd>
            </>
          )}
          {resource.hours && (
            <>
              <dt style={{ color: "var(--ink-soft)" }}>Hours</dt>
              <dd style={{ margin: 0 }}>{resource.hours}</dd>
            </>
          )}
          {resource.requirements && (
            <>
              <dt style={{ color: "var(--ink-soft)" }}>Bring / needs</dt>
              <dd style={{ margin: 0 }}>{resource.requirements}</dd>
            </>
          )}
          {resource.website && (
            <>
              <dt style={{ color: "var(--ink-soft)" }}>Website</dt>
              <dd style={{ margin: 0 }}>
                <a href={resource.website} target="_blank" rel="noopener noreferrer">
                  {resource.website.replace(/^https?:\/\//, "")}
                </a>
              </dd>
            </>
          )}
        </dl>
      </div>

      <div style={{ maxWidth: 720 }}>
        <ResourceMapLoader resource={resource} />
      </div>
    </div>
  );
}

