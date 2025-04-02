/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Early 2000s color palette
        primary: '#336699',    // Classic "web blue"
        secondary: '#993366',  // Deep magenta
        accent: '#FF9900',     // Orange
        background: '#EFEFEF', // Light gray
        element: '#FFFFFF',    // White panels/windows
        border: '#999999',     // Medium gray
      },
      fontFamily: {
        sans: ['"MS Sans Serif"', 'Tahoma', 'Arial', 'sans-serif'],
        mono: ['"Courier New"', 'monospace'],
      },
      boxShadow: {
        'win98': 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf',
        'win98-pressed': 'inset -1px -1px #ffffff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080',
      },
    },
  },
  plugins: [],
} 