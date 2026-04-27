/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF", // A nice deep blue
        secondary: "#3B82F6",
        accent: "#F59E0B",
        background: "#F3F4F6",
        surface: "#FFFFFF",
      }
    },
  },
  plugins: [],
}
