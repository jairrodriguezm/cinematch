import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          white: "rgba(255, 255, 255, 0.1)",
          border: "rgba(255, 255, 255, 0.2)",
          bgDark: "rgba(15, 23, 42, 0.3)",
          borderDark: "rgba(255, 255, 255, 0.08)",
        }
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        glassHover: "0 12px 40px 0 rgba(31, 38, 135, 0.25)",
      },
      backdropBlur: {
        glass: "12px",
      }
    },
  },
  plugins: [],
};

export default config;
// Config file created for IDE tools and compatibility
