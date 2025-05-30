/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#004cac',
          hover: '#003d82',
        },
        secondary: '#004cac',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        'desafio-blue': '#1b58ab',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
        'archivo-black': ['Archivo Black', 'sans-serif'],
        'passion-one': ['Passion One', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['13px', '18px'],
        base: ['15px', '22px'],
        lg: ['16px', '24px'],
        xl: ['18px', '28px'],
        '2xl': ['20px', '30px'],
        '3xl': ['24px', '32px'],
      },
      borderRadius: {
        'xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};