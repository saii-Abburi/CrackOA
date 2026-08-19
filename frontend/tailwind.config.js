/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0A',
          secondary: '#111111',
          card: '#151515',
          elevated: '#1A1A1A',
        },
        accent: {
          DEFAULT: '#FF6B00',
          hover: '#FF8533',
          muted: '#FF6B0020',
          dim: '#FF6B0010',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#52525B',
          dim: '#3F3F46',
        },
        border: {
          DEFAULT: '#1F1F1F',
          subtle: '#2A2A2A',
          accent: '#FF6B0040',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'count-up': 'countUp 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'accent-sm': '0 0 20px rgba(255, 107, 0, 0.15)',
        'accent-md': '0 0 40px rgba(255, 107, 0, 0.2)',
        'accent-lg': '0 0 80px rgba(255, 107, 0, 0.15)',
      },
      backgroundImage: {
        'accent-radial': 'radial-gradient(ellipse at center, rgba(255,107,0,0.12) 0%, transparent 70%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(255,107,0,0.08) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
};
