/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — earthy provincial warmth
        forest:  { DEFAULT: '#2D5016', light: '#4A7C2F', dark: '#1A2E0A' },
        stone:   { DEFAULT: '#8B7355', light: '#B8A48A', dark: '#5C4A32' },
        clay:    { DEFAULT: '#C4622D', light: '#E8845A', dark: '#8B3D16' },
        cream:   { DEFAULT: '#F5F0E8', dark: '#E8E0D0' },
        leaf:    { DEFAULT: '#7AB648', light: '#A3D170' },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        body:    ['system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
