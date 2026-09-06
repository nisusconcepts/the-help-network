// Placeholder sponsor banner. Sits at the very top of every page, above
// the header, so it reads as a real top-of-site banner slot rather than
// competing with in-page content. No ad network is wired up — there's no
// paying sponsor yet — so this is just a clearly-labeled placeholder that
// shows where that space will live once there is one. Swap the contents
// of this component (or route it through a real ad slot/sponsor rotation)
// once a sponsor is signed.
export default function AdBanner() {
  return (
    <div style={{ background: "linear-gradient(90deg, var(--teal-dark), var(--teal))" }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, color: "#eef7f5" }}>
          <strong>Sponsor space available.</strong> This spot is reserved for a community partner — nothing is
          running here yet.
        </span>
        <a
          href="mailto:nisusconcepts@gmail.com?subject=Sponsoring%20The%20Help%20Haven%20Network"
          style={{
            color: "#eef7f5",
            fontSize: 12.5,
            fontWeight: 600,
            textDecoration: "underline",
            flex: "none",
          }}
        >
          Inquire about sponsoring &rarr;
        </a>
      </div>
    </div>
  );
}
