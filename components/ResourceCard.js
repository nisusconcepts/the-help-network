import Link from "next/link";
import { CATEGORY_BY_SLUG } from "@/lib/categories";

export default function ResourceCard({ resource, onSelect }) {
  const cat = CATEGORY_BY_SLUG[resource.category];

  return (
    <article
      className="panel-block"
      style={{ padding: "16px 17px", display: "flex", flexDirection: "column", gap: 9, cursor: onSelect ? "pointer" : "default" }}
      onClick={() => onSelect && onSelect(resource.id)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <h3 style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.3 }}>
          <Link href={`/resource/${resource.id}`} style={{ color: "inherit", textDecoration: "none" }}>
            {resource.name}
          </Link>
        </h3>
        <span
          className="badge"
          style={{
            borderColor: "transparent",
            background: cat ? cat.tint : "var(--teal-tint)",
            color: cat ? cat.color : "var(--teal-dark)",
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            fontWeight: 600,
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {cat ? cat.label : resource.category}
        </span>
      </div>

      <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 13.5, lineHeight: 1.5 }}>
        {resource.description}
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {resource.hours_247 && <span className="badge urgent">24/7</span>}
        {resource.free && <span className="badge free">Free</span>}
        {resource.offers_detox && <span className="badge">Detox available</span>}
        {resource.area && <span className="badge">{resource.area}</span>}
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 9,
          borderTop: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          fontSize: 13,
        }}
      >
        {resource.phone && (
          <div style={{ display: "flex", gap: 7, color: "var(--ink-soft)" }}>
            <span>Call</span>
            <a className="mono" style={{ color: "var(--ink)" }} href={`tel:${resource.phone.replace(/[^\d+]/g, "")}`}>
              {resource.phone}
            </a>
          </div>
        )}
        {resource.address && (
          <div style={{ display: "flex", gap: 7, color: "var(--ink-soft)" }}>
            <span>Where</span>
            <span style={{ color: "var(--ink)" }}>{resource.address}</span>
          </div>
        )}
        {resource.hours && (
          <div style={{ display: "flex", gap: 7, color: "var(--ink-soft)" }}>
            <span>Hours</span>
            <span style={{ color: "var(--ink)" }}>{resource.hours}</span>
          </div>
        )}
      </div>
    </article>
  );
}

