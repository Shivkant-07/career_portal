/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#2f5fe0",
          600: "#2650c4",
          700: "#1e40a3",
        },
      },
    },
  },
  plugins: [],
};
