/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        surface3: 'var(--surface3)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        border2: 'var(--border2)',
        primary: { DEFAULT: 'var(--purple)', light: 'var(--purple-light)' },
        purple: { DEFAULT: 'var(--purple)', light: 'var(--purple-light)' },
        pink: { DEFAULT: 'var(--pink)', light: 'var(--pink-light)' },
        accent: { DEFAULT: 'var(--accent)', strong: 'var(--accent-strong)', soft: 'var(--accent-soft)' },
        success: { DEFAULT: 'var(--green-strong)', soft: 'var(--green)' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Bricolage Grotesque', 'sans-serif'],
        body: ['var(--font-body)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      backgroundImage: {
        'brand-grad': 'var(--grad)',
        'aurora': 'radial-gradient(closest-side, color-mix(in srgb, var(--purple) 55%, transparent), transparent), radial-gradient(closest-side, color-mix(in srgb, var(--accent) 45%, transparent), transparent)',
      },
      animation: {
        heartbeat: 'heartbeat 1s infinite',
        float: 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        aurora: 'auroraShift 16s ease-in-out infinite alternate',
        marquee: 'marquee 26s linear infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        heartbeat: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        glowPulse: { '0%,100%': { boxShadow: '0 0 20px rgba(222,84,153,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(222,84,153,0.6)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        auroraShift: {
          '0%': { backgroundPosition: '20% 30%, 80% 20%' },
          '100%': { backgroundPosition: '32% 42%, 66% 34%' },
        },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.55' } },
      },
    },
  },
  plugins: [],
}
