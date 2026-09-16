/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sovereign: {
          navy: '#0F2D59',
          brass: '#B45309',
          green: '#15803D',
          bg: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Public Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
