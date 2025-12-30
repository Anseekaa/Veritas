/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fbf5f7',
          100: '#f6eaef',
          200: '#edd4df',
          300: '#e0b2c6',
          400: '#cc85a3',
          500: '#a74f73', // Dusty Rose (Base)
          600: '#943e60',
          700: '#7a2f4d',
          800: '#662942',
          900: '#56253a',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#eaedf0',
          200: '#d0d7de',
          300: '#aab6c2',
          400: '#7d8fa1',
          500: '#586b80',
          600: '#435366',
          700: '#34495e', // Muted Navy (Base)
          800: '#2d3d4d',
          900: '#28333f',
        },
        paper: '#fdfbf7', // Warm off-white for cards
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'], // Clean modern body
        heading: ['"Playfair Display"', 'serif'], // Editorial headings
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      }
    },
  },
  plugins: [],
}
