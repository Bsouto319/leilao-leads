const ll = require('./src/tailwind-colors.js')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: ll.colors,
      fontFamily: ll.fontFamily,
    },
  },
  plugins: [],
}
