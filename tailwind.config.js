/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          green: "#6BCB77",
          pink: "#FFB5B5",
          white: "#FFFFFF",
          dark: "#222222",
          gray: "#666666",
          soft: "#F9FBF9", // Very light green/gray background
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
