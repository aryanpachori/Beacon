import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dl: {
          /* Wired to globals.css tokens so .dark overrides apply automatically */
          blue: "var(--dl-blue)",
          "blue-light": "var(--dl-blue-light)",
          "blue-dark": "var(--dl-blue-dark)",
          "blue-pale": "var(--dl-blue-pale)",
          aurora: "var(--dl-aurora)",

          bg: "var(--dl-bg)",
          surface: "var(--dl-surface)",
          border: "var(--dl-border)",
          muted: "var(--dl-muted)",
          text: "var(--dl-text)",
          navy: "var(--dl-navy)",

          healthy: "var(--dl-healthy)",
          watch: "var(--dl-watch)",
          risk: "var(--dl-risk)",
          critical: "var(--dl-critical)",
          danger: "var(--dl-danger)",
          warning: "var(--dl-warning)",
          success: "var(--dl-success)",

          teal: "var(--dl-teal)",
          sage: "var(--dl-sage)",
          "sage-light": "var(--dl-sage-light)",
          cream: "var(--dl-cream)",
          card: "var(--dl-card)",
          nav: "var(--dl-nav)",
          page: "var(--dl-page)",
          forest: "var(--dl-forest)",
          hint: "var(--dl-hint)",
          m: {
            text: "var(--dl-m-text)",
            muted: "var(--dl-m-muted)",
            border: "var(--dl-m-border)",
          },
        },
        dash: {
          critical: "var(--dl-critical)",
          risk: "var(--dl-risk)",
          watch: "var(--dl-watch)",
          healthy: "var(--dl-healthy)",
          bg: "var(--dl-bg)",
          surface: "var(--dl-surface)",
          border: "var(--dl-border)",
          muted: "var(--dl-muted)",
          text: "var(--dl-text)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        serif: ["Iowan Old Style", "Georgia", "Cambria", "serif"],
      },
      fontSize: {
        hero: [
          "4.25rem",
          { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "500" },
        ],
        "hero-mobile": [
          "2.5rem",
          { lineHeight: "1.08", letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        section: ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "500" }],
        "section-mobile": [
          "1.75rem",
          { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "500" },
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease both",
        "fade-in": "fade-in 0.3s ease both",
        "slide-in-left": "slide-in-left 0.35s ease both",
        "scale-in": "scale-in 0.3s ease both",
        shimmer: "shimmer 2s linear infinite",
        marquee: "marquee 35s linear infinite",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover":
          "0 12px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(46,230,168,0.12)",
        blue: "0 4px 20px rgba(46,230,168,0.25)",
        glow: "0 0 40px rgba(46,230,168,0.18)",
        "glow-aurora": "0 0 40px rgba(34,211,238,0.15)",
        edge: "0 1px 0 0 rgba(255,255,255,0.04) inset",
        panel: "0 24px 64px -20px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
