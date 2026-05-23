import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ACCENT_SOFT, STORAGE_KEYS } from "@/lib/theme";

const sans = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
const mono = JetBrains_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Pheme — dashboard",
  description: "Manage projects, memory, and API keys for the Pheme shared memory layer.",
};

/* Apply stored theme prefs before first paint (no flash). Dark is the default
   direction, so only light-mode users / custom accents trigger any work here. */
const themeScript = `(function(){try{
var K=${JSON.stringify(STORAGE_KEYS)};
var SOFT=${JSON.stringify(ACCENT_SOFT)};
var r=document.documentElement;
var m=localStorage.getItem(K.mode);
if(m==='light'){r.setAttribute('data-theme','light');}
var a=localStorage.getItem(K.accent);
if(a&&SOFT[a]){r.style.setProperty('--accent',a);r.style.setProperty('--accent-soft',SOFT[a]);}
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
