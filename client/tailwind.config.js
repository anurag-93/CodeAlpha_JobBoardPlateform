/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f8e5',
          100: '#e4f2ca',
          200: '#d5edaa',
          300: '#c7fa68',
          400: '#bff45c',
          500: '#b7ef54',
          600: '#a3db3f',
          700: '#8fc52c',
          800: '#6e9a20',
          900: '#4f7119',
          950: '#293c0d',
        },
      },
    },
  },
  plugins: [],
};
