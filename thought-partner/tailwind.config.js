/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        secondary: "#6366f1",
        background: "#f8fafc",
        surface: "#ffffff",
      },
    },
  },
  plugins: [],
};
