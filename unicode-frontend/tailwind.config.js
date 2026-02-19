/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 8px 24px rgba(15, 23, 42, 0.08)",
      },
      colors: {
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          500: "#14b8a6",
          600: "#0f766e",
          700: "#0f766e",
          800: "#2563eb",
        },
      },
    },
  },
  plugins: [],
};

