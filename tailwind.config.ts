import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FBF7F0',
        cream: '#F6EFE4',
        beige: '#EDE3D3',
        sand: '#E2D2BA',
        champagne: '#C6A15B',
        gold: '#A8853F',
        brown: '#3B2A20',
        mocha: '#6B5747',
        ink: '#241A14',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Didot', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Jost', 'Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.28em',
      },
      boxShadow: {
        soft: '0 24px 60px -32px rgba(59, 42, 32, 0.45)',
        card: '0 18px 40px -30px rgba(59, 42, 32, 0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out both',
        shimmer: 'shimmer 8s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
