import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FEE8F0',
          100: '#FDD0E3',
          200: '#FBA8CC',
          300: '#F878AA',
          400: '#F5548C',
          500: '#E61D6F',
          600: '#D60B5F',
          700: '#C10052',
          800: '#9D0048',
          900: '#7A003C',
        },
        accent: {
          50: '#F0E8FF',
          100: '#E0D0FF',
          200: '#C5A8FF',
          300: '#A878FF',
          400: '#8F54FF',
          500: '#7030FF',
          600: '#6018FF',
          700: '#5200E6',
          800: '#4500CC',
          900: '#3A00B2',
        },
        success: {
          50: '#F0FDF4',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          50: '#FFFBEB',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-subtle': 'bounce-subtle 0.5s ease-out',
        'swipe-out-left': 'swipe-out-left 0.3s ease-out',
        'swipe-out-right': 'swipe-out-right 0.3s ease-out',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'swipe-out-left': {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(-120%) rotate(-15deg)', opacity: '0' },
        },
        'swipe-out-right': {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(120%) rotate(15deg)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(254, 59, 121, 0.4)',
      },
    },
  },
  plugins: [],
}
export default config
