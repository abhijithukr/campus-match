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
        bg: '#faeee7',
        surface: '#fffffe',
        surface2: '#fdf1eb',
        surface3: '#f8e3db',
        purple: { DEFAULT: '#fe019a', light: '#e0557e', dark: '#e0557e' },
        pink: { DEFAULT: '#fe019a', light: '#ffc6c7', dark: '#e0557e' },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, #fe019a, #ffc6c7)',
      },
      animation: {
        'heartbeat': 'heartbeat 1s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
      },
      keyframes: {
        heartbeat: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        glowPulse: { '0%,100%': { boxShadow: '0 0 20px rgba(254,1,154,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(254,1,154,0.6)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      }
    },
  },
  plugins: [],
}
