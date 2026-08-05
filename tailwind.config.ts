import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#371f7d",
        surface: "#371f7d",
        "surface-dim": "#371f7d",
        "surface-container": "#1f1f23",
        "surface-container-low": "#1b1b1f",
        "surface-container-high": "#2a2a2e",
        "surface-container-highest": "#353439",
        primary: "#ffffff",
        "primary-container": "#bc96ff",
        "primary-fixed": "#bc96ff",
        secondary: "#ff4365",
        "secondary-container": "#ff4365",
        tertiary: "#bc96ff",
        "on-background": "#ffffff",
        "on-surface": "#ffffff",
        "on-surface-variant": "#e4e1e7",
        "on-primary": "#ffffff",
        outline: "#8e937f",
        "outline-variant": "#444938",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        "3xl": "3rem",
        full: "9999px",
      },
      spacing: {
        "stack-lg": "32px",
        "margin-desktop": "48px",
        unit: "4px",
        "stack-md": "16px",
        "margin-mobile": "20px",
        "stack-sm": "8px",
        gutter: "16px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-hanken)", "Hanken Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
