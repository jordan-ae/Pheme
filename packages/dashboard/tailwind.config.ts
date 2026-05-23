import type { Config } from "tailwindcss";

/* Same token-driven setup as the marketing site (see app/globals.css). Tailwind is
   kept for layout utilities; colors/fonts map onto the shared design tokens, which
   now also carry a dark theme via [data-theme="dark"]. */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Instrument Serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        cream: "var(--cream)",
        peach: "var(--peach)",
        "peach-deep": "var(--peach-deep)",
        rose: "var(--rose)",
        butter: "var(--butter)",
        mint: "var(--mint)",
        "mint-deep": "var(--mint-deep)",
        sky: "var(--sky)",
        lavender: "var(--lavender)",
        plum: "var(--plum)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        "ink-4": "var(--ink-4)",
        accent: "var(--accent)",
      },
      borderColor: {
        DEFAULT: "var(--line)",
      },
    },
  },
  plugins: [],
};

export default config;
