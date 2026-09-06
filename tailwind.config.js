/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#090D16',
          panel: '#0B0F19',
          raised: '#11162228',
        },
        dept: {
          engineering: '#38BDF8',
          trd: '#F59E0B',
          snt: '#F43F5E',
          joint: '#A78BFA',
        },
        signal: {
          red: '#EF4444',
          amber: '#F59E0B',
          green: '#22C55E',
        },
        train: {
          moving: '#22D3EE',
          parked: '#FBBF24',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};