/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0b0d',
        'dark-surface': '#1a1b1e',
        'dark-border': '#2a2d31',
        'accent-blue': '#4f46e5',
        'accent-green': '#10b981',
        'accent-red': '#ef4444',
        'text-primary': '#ffffff',
        'text-secondary': '#9ca3af',
      },
    },
  },
  plugins: [],
}
