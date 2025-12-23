/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#f9f506",
        "primary-dark": "#d9d505",
        "secondary": "#1e3a8a", 
        "secondary-light": "#2563eb",
        "accent": "#f59e0b",
        "glass-white": "rgba(255, 255, 255, 0.7)",
        "glass-dark": "rgba(15, 23, 42, 0.6)",
      },
      fontFamily: {
        "display": ["Spline Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "full": "9999px"
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to right bottom, rgba(30, 58, 138, 0.9), rgba(30, 58, 138, 0.4))',
      }
    },
  },
  plugins: [],
}