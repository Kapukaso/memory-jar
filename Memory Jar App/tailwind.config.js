/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          'pink-100': '#fec5bb',
          'pink-200': '#fcd5ce',
          'pink-300': '#fae1dd',
          'white-pink': '#f8edeb',
          'platinum': '#e8e8e4',
          'gray-green': '#d8e2dc',
          'almond': '#ece4db',
          'champagne': '#ffe5d9',
          'apricot': '#ffd7ba',
          'peach': '#fec89a',
        }
      }
    },
  },
  plugins: [],
}
