import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: '#7C3AED',
      },
      boxShadow: {
        card: '0 12px 32px rgba(15, 23, 42, 0.06)',
        cardHover: '0 18px 40px rgba(15, 23, 42, 0.09)',
      }
    },
  },
  plugins: [],
};

export default config;
// Config file created for IDE tools and compatibility
