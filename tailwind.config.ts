import type { Config } from "tailwindcss";

/** DMX Logistics: Apple-minimalist. White #fff, charcoal #18181b, Wine Red #5e1914, sharp edges. */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0",
        md: "0",
        sm: "0",
        none: "0",
      },
      colors: {
        charcoal: "#18181b",
        dmxRed: "#5e1914",
        "profit-green": "#166534",
        "dmx-red": "#5e1914",
        "dmx-red-hover": "#4a130f",
        "dmx-black": "#0a0a0a",
        "dmx-blue": "#2563eb",
        "dmx-border": "#262626",
        "pure-black": "#000000",
        "slate-gray": "#1a1a1a",
        "logistics-blue": "#3b82f6",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "var(--logistics-blue)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        /* DMX luxury palette */
        "dmx-bg": "hsl(var(--dmx-bg))",
        "dmx-foreground": "hsl(var(--dmx-foreground))",
        "dmx-muted": "hsl(var(--dmx-muted))",
        "dmx-accent": "hsl(var(--dmx-accent))",
        "dmx-card": "hsl(var(--dmx-card))",
        "dmx-primary": "hsl(var(--dmx-primary))",
        "dmx-primary-foreground": "hsl(var(--dmx-primary-foreground))",
        "dmx-gold": "hsl(var(--dmx-gold))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
