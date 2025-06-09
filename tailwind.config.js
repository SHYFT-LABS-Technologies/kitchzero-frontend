/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern SaaS color palette
        gray: {
          25: '#fcfcfd',
          50: '#f9fafb',
          100: '#f2f4f7',
          200: '#eaecf0',
          300: '#d0d5dd',
          400: '#98a2b3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1d2939',
          900: '#101828',
        },
        primary: {
          25: '#fcfaff',
          50: '#f9f5ff',
          100: '#f4ebff',
          200: '#e9d7fe',
          300: '#d6bbfb',
          400: '#b692f6',
          500: '#9333ea',
          600: '#7c3aed',
          700: '#6b21a8',
          800: '#581c87',
          900: '#4c1d95',
        },
        success: {
          25: '#f6fef9',
          50: '#ecfdf3',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          25: '#fffcf5',
          50: '#fffaeb',
          500: '#f79009',
          600: '#dc6803',
        },
        error: {
          25: '#fffbfa',
          50: '#fef3f2',
          500: '#f04438',
          600: '#d92d20',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['72px', { lineHeight: '90px', letterSpacing: '-0.02em' }],
        'display-xl': ['60px', { lineHeight: '72px', letterSpacing: '-0.02em' }],
        'display-lg': ['48px', { lineHeight: '60px', letterSpacing: '-0.02em' }],
        'display-md': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em' }],
        'display-sm': ['30px', { lineHeight: '38px' }],
        'display-xs': ['24px', { lineHeight: '32px' }],
      },
      boxShadow: {
        'xs': '0px 1px 2px rgba(16, 24, 40, 0.05)',
        'sm': '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        'md': '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
        'lg': '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        'xl': '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
        '2xl': '0px 24px 48px -12px rgba(16, 24, 40, 0.18)',
        '3xl': '0px 32px 64px -12px rgba(16, 24, 40, 0.14)',
      },
      borderRadius: {
        'none': '0px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}