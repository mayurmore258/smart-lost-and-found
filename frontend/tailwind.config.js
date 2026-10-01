/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#346b4f',
          hover: '#3d7a5b',
          light: '#99d3b0',
          dark: '#14422d',
          fixed: '#b4f0cc',
        },
        surface: {
          DEFAULT: '#131413',
          card: '#1c1e1d',
          border: '#2f3330',
          hover: '#222523',
          container: '#1f201f',
        },
        accent: {
          amber: '#fdb881',
          amberBg: '#8e592a',
          slate: '#949994',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
