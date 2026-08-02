/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        game: ['"Georgia"', 'ui-serif', 'serif'],
      },
      colors: {
        mud: '#3a2f24',
        moss: '#4a5a3a',
        fog: '#8a9088',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.82' },
        },
      },
      animation: {
        flicker: 'flicker 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
