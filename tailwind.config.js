/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      colors: {
        bg0: '#0B1537',
        bg1: '#0F1B43',
        bg2: '#111C44',
        bg3: '#1A204A',
        ink: '#FFFFFF',
        ink2: '#A0AEC0',
        ink3: '#718096',
        accentCyan: '#01B5EC',
        accentBlue: '#0075FF',
        accentPurple: '#582CFF',
        accentPink: '#FF0080',
        accentGreen: '#01B574',
        accentRed: '#E31A1A',
        accentAmber: '#FFB547',
      },
    },
  },
  plugins: [],
}
