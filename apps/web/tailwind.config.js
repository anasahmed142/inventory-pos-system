/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/*/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f766e',
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: '#f59e0b',
          foreground: '#000000'
        }
      }
    }
  },
  plugins: []
}