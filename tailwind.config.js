/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        ink: '#101114',
        lime: { DEFAULT: '#B8FF45', dark: '#9DE02E' },
        surface: '#F7F8FA',
        muted: '#6B7280',
        line: '#E5E7EB',
        night: '#18181B',
        'text-dark': '#111827',
        'text-light': '#F9FAFB',
      },
      fontFamily: { sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '12px', control: '10px' },
      boxShadow: {
        card: '0 1px 2px rgba(16,17,20,0.06), 0 1px 3px rgba(16,17,20,0.04)',
        lift: '0 8px 24px rgba(16,17,20,0.10)',
      },
      maxWidth: { page: '1360px' },
      transitionDuration: { DEFAULT: '180ms' },
    },
  },
  plugins: [],
};
