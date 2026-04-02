/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B3D2E',
        secondary: '#5C8A64',
        accent: '#C89B3C',
        highlight: '#F4B400',
      },
    },
  },
  plugins: [],
};
