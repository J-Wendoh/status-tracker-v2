/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rich Brown-Orange Primary (Government/Official feel)
        primary: {
          50: '#fef7f2',
          100: '#fdeee3',
          200: '#fad5b8',
          300: '#f7bd8d',
          400: '#f1a562',
          500: '#d2691e', // Rich brown-orange main
          600: '#b8561a',
          700: '#9e4316',
          800: '#843012',
          900: '#6b1e0e',
        },
        // Kenyan Flag Green (for success states)
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#006d3a', // Kenyan flag green
          600: '#005f34',
          700: '#00512d',
          800: '#004327',
          900: '#003620',
        },
        // Kenyan Flag Red (for accents/warnings)
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#dc2626', // Kenyan flag red
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#661614',
        },
        // Sophisticated Neutrals
        neutral: {
          900: '#1c1917', // Warm dark brown
          800: '#292524',
          700: '#44403c',
          600: '#57534e',
          500: '#78716c',
          400: '#a8a29e',
          300: '#d6d3d1',
          200: '#e7e5e4',
          100: '#f5f5f4',
          50: '#fafaf9',
        },
        // Luxurious Gold (for premium touches)
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Rich gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        sans: ['Noto Sans', 'Public Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.025em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'xl': ['20px', { lineHeight: '32px', letterSpacing: '-0.015em' }],
        '2xl': ['24px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        '3xl': ['32px', { lineHeight: '44px', letterSpacing: '-0.025em' }],
        '4xl': ['40px', { lineHeight: '52px', letterSpacing: '-0.03em' }],
        '5xl': ['48px', { lineHeight: '60px', letterSpacing: '-0.035em' }],
        '6xl': ['64px', { lineHeight: '76px', letterSpacing: '-0.04em' }],
        // Display typography
        'display-sm': ['36px', { lineHeight: '44px', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['48px', { lineHeight: '56px', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['60px', { lineHeight: '72px', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-xl': ['72px', { lineHeight: '84px', letterSpacing: '-0.04em', fontWeight: '700' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px', 
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '80px',
        '5xl': '96px',
        '6xl': '128px',
        // Micro-spacing for precision
        '0.5': '2px',
        '1.5': '6px',
        '2.5': '10px',
        '3.5': '14px',
        // Component specific spacing
        'section': '80px',
        'container': '120px',
        'hero': '160px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'glass': '0 10px 30px rgba(12,12,15,0.12)',
        'card': '0 4px 20px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.12)',
        'luxury': '0 20px 60px rgba(210,105,30,0.15)', // Brown-orange luxury shadow
        'gold': '0 8px 32px rgba(245,158,11,0.2)', // Gold accent shadow
        'kenyan': '0 4px 20px rgba(0,109,58,0.15)', // Kenyan green shadow
      },
      backgroundImage: {
        'kenyan-gradient': 'linear-gradient(135deg, #dc2626 0%, #000000 50%, #006d3a 100%)',
        'luxury-gradient': 'linear-gradient(135deg, #d2691e 0%, #f59e0b 100%)',
        'warm-gradient': 'linear-gradient(135deg, #fef7f2 0%, #fdeee3 100%)',
        'government-gradient': 'linear-gradient(135deg, #1c1917 0%, #44403c 50%, #d2691e 100%)',
      },
      backdropFilter: {
        'glass': 'blur(16px)',
      },
      animation: {
        // Existing animations
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'auth-swap': 'authSwap 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        'number-flip': 'numberFlip 0.6s ease-out',
        // Premium micro-interactions
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out',
        'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'zoom-in': 'zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'rotate-in': 'rotateIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        // Loading states
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'progress': 'progress 2s ease-in-out infinite',
        // Data visualization
        'draw-path': 'drawPath 1.5s ease-in-out forwards',
        'fill-bar': 'fillBar 1s ease-in-out forwards',
        'count-up': 'countUp 1.2s ease-out forwards',
      },
      keyframes: {
        // Existing keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.98)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        authSwap: {
          '0%': { transform: 'translateX(30px) rotateY(1deg)', opacity: '0' },
          '100%': { transform: 'translateX(0) rotateY(0deg)', opacity: '1' },
        },
        numberFlip: {
          '0%': { transform: 'rotateX(-90deg)' },
          '50%': { transform: 'rotateX(0deg) scale(1.1)' },
          '100%': { transform: 'rotateX(0deg) scale(1)' },
        },
        // Premium micro-interactions
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(210, 105, 30, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(210, 105, 30, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounceSoft: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-10deg) scale(0.8)', opacity: '0' },
          '100%': { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        },
        // Loading states
        skeleton: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // Data visualization
        drawPath: {
          '0%': { strokeDasharray: '0 1000' },
          '100%': { strokeDasharray: '1000 1000' },
        },
        fillBar: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}