export const metadata = { title: "About — The Help Network" };

export default function AboutPage() {
  return (
    <div className="panel-block" style={{ maxWidth: 680 }}>
      <h2 style={{ fontSize: 22, marginBottom: 12 }}>About The Help Network</h2>
      <p style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
        The Help Network is a directory of mental health, substance abuse recovery, shelter, domestic
        violence, LGBTQ+, food assistance, and clothing/essentials resources. It started in North Texas,
        with the goal of growing city by city over time.
      </p>
      <p style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
        Anyone can search the directory for free. Anyone can also submit a resource — including
        organizations listing themselves directly — and every submission is reviewed before it goes
        live, to keep listings accurate and to keep bad actors out.
      </p>
      <p style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
        <strong>This is an informational directory only.</strong> It is not a substitute for
        professional medical, legal, or crisis care. If you or someone else is in immediate danger,
        call 911. Listings are community-sourced and reviewed, but hours and eligibility can change —
        always confirm directly with the organization before you go.
      </p>
    </div>
  );
}
