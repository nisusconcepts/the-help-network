import Link from "next/link";
import "./globals.css";
import Header from "@/components/Header";

const SITE_URL = "https://the-help-network-nisus-concepts.vercel.app";
const SITE_NAME = "The Help Haven Network";
const SITE_DESCRIPTION =
  "A directory of mental health, recovery, shelter, and support resources — starting in North Texas, built to grow nationwide — open for organizations to list themselves.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  // Social preview cards (Facebook/LinkedIn/iMessage via Open Graph, plus
  // Twitter/X's own tags) — without these, a shared link shows no title,
  // description, or image, just a bare URL. No logo/image asset exists yet,
  // so this is text-only for now; add an `images` entry here once one does.
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this is the root layout (App Router's
            equivalent of _document), so this stylesheet is already applied site-wide, not per-page. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <Header />
        <main className="shell">{children}</main>
        <footer className="shell" style={{ paddingTop: 24, paddingBottom: 24, color: "var(--ink-soft)", fontSize: 12 }}>
          Informational directory only — not a substitute for professional medical, legal, or crisis
          care. If you or someone else is in immediate danger, call 911. Listings are community-sourced
          and reviewed, but always confirm hours and eligibility directly with the organization.
          {" · "}
          <Link href="/admin" style={{ color: "var(--ink-soft)" }}>
            Admin
          </Link>
        </footer>
      </body>
    </html>
  );
}
