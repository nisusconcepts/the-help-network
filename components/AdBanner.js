// Placeholder sponsor banner. No ad network is wired up — there's no
// paying sponsor yet — so this is just a clearly-labeled, dismissible-free
// placeholder that shows where that space will live once there is one.
// Swap the contents of this component (or route it through a real ad
// slot/sponsor rotation) once a sponsor is signed.
export default function AdBanner() {
  return (
    <div
      className="panel-block"
      style={{
        marginBottom: 20,
        padding: "14px 18px",
        border: "1px dashed var(--line)",
        background: "var(--panel)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
        <strong style={{ color: "var(--ink)" }}>Sponsor space available.</strong> This spot is reserved for a
        community partner — nothing is running here yet.
      </span>
      <a
        href="mailto:nisusconcepts@gmail.com?subject=Sponsoring%20Reslo"
        className="btn"
        style={{ background: "transparent", border: "1px solid var(--line)", fontSize: 12.5, flex: "none" }}
      >
        Inquire about sponsoring
      </a>
    </div>
  );
}

