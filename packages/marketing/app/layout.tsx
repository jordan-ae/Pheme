import type { Metadata } from "next";
import { Instrument_Serif, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { RevealObserver } from "@/components/reveal";
import { PageBackground } from "@/components/page-shell";
import { ACCENT_SOFT, WARMTH_ATMOSPHERE, STORAGE_KEYS } from "@/lib/theme";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});
const sans = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
const mono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Pheme — the shared memory layer for AI coding agents",
  description:
    "Decisions, constraints, and tradeoffs travel with the project — not the conversation. The shared memory layer for Claude Code, Cursor, and Windsurf.",
  metadataBase: new URL("https://phemesh.dev"),
  openGraph: {
    title: "Pheme — the shared memory layer for AI coding agents",
    description:
      "Code agents that remember what you decided. Persistent, branch-aware project memory for every coding agent.",
    url: "https://phemesh.dev",
    siteName: "Pheme",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pheme — the shared memory layer for AI coding agents",
    description: "Memory for AI coding agents. Stop re-explaining decisions you made last week.",
  },
};

/* Apply stored theme prefs before first paint to avoid a flash. Defaults
   (cool atmosphere + lavender accent + ornaments on) already match the CSS,
   so only returning visitors with custom prefs trigger any work here. */
const themeScript = `(function(){try{
var K=${JSON.stringify(STORAGE_KEYS)};
var SOFT=${JSON.stringify(ACCENT_SOFT)};
var WARM=${JSON.stringify(WARMTH_ATMOSPHERE)};
var r=document.documentElement;
var a=localStorage.getItem(K.accent);
if(a&&SOFT[a]){r.style.setProperty('--accent',a);r.style.setProperty('--accent-soft',SOFT[a]);}
var w=localStorage.getItem(K.warmth);
if(w&&WARM[w]){r.style.setProperty('--atmosphere',WARM[w]);}
if(localStorage.getItem(K.ornaments)==='off'){r.setAttribute('data-ornaments','off');}
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          {/* Without JS, scroll-reveal can't run — keep content visible. */}
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <PageBackground />
        <Nav />
        <main>{children}</main>
        <Footer />
        <ThemeSwitcher />
        <RevealObserver />
      </body>
    </html>
  );
}
