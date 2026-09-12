import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dojo: {
          950: '#0a0908',
          900: '#14110e',
          800: '#1f1a15',
          700: '#2b241c',
        },
        karate: {
          red: '#c8102e',
          darkred: '#8f0b21',
          gold: '#d4a017',
          sand: '#f5efe4',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out both',
        'ken-burns': 'kenBurns 24s ease-in-out infinite alternate',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'pulse-glow': 'pulseGlow 2.6s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.6s ease-out both',
        'kata': 'kata 9s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0,0)' },
          '100%': { transform: 'scale(1.15) translate(-1.5%, 1.5%)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,16,46,0.55)' },
          '50%': { boxShadow: '0 0 0 14px rgba(200,16,46,0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(60px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        kata: {
          '0%, 100%': { transform: 'translateX(-4%) rotate(-2deg)', opacity: '0.16' },
          '50%': { transform: 'translateX(4%) rotate(2deg)', opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
