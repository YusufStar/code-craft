import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        "gradient-border": "gradient-border 3s linear infinite",
        "background-move": "background-move 10s ease-in-out infinite",
      },
      keyframes: {
        "gradient-border": {
          "0%": {
            borderImageSource: "linear-gradient(90deg, #ff0080, #ffcd3c)",
          },
          "50%": {
            borderImageSource: "linear-gradient(180deg, #ff0080, #00ffff)",
          },
          "100%": {
            borderImageSource: "linear-gradient(270deg, #ffcd3c, #ff0080)",
          },
        },
        "background-move": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
