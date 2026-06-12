import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dl: {
          /* ── Brand blue (Soothing Sapphire) ── */
          blue:        '#2f7eda',
          'blue-light':'#5b9fe8',
          'blue-dark': '#1a5fb4',
          'blue-pale': '#eaf2fd',

          /* ── Palette tokens ── */
          bg:      '#fcfdfd',   /* Brilliance */
          surface: '#edeff3',   /* Springtime Rain */
          border:  '#c6d1d7',   /* Wind Weaver */
          muted:   '#9fa0b5',   /* Wild Thistle */
          text:    '#555663',   /* Blackwater */
          navy:    '#1e2a3c',   /* sidebar dark */

          /* ── Status / health ── */
          healthy:  '#16a34a',
          watch:    '#ca8a04',
          risk:     '#ea580c',
          critical: '#dc2626',
          danger:   '#ef4444',
          warning:  '#f97316',
          success:  '#22c55e',

          /* ── Legacy aliases (keeps old classnames working) ── */
          teal:        '#2f7eda',
          sage:        '#9fa0b5',
          'sage-light':'#c6d1d7',
          cream:       '#edeff3',
          card:        '#edeff3',
          nav:         '#1e2a3c',
          page:        '#fcfdfd',
          forest:      '#555663',
          hint:        '#9fa0b5',
          'm': {
            text:   '#555663',
            muted:  '#9fa0b5',
            border: '#c6d1d7',
          },
        },
        dash: {
          critical: '#dc2626',
          risk:     '#ea580c',
          watch:    '#ca8a04',
          healthy:  '#16a34a',
          bg:       '#fcfdfd',
          surface:  '#edeff3',
          border:   '#c6d1d7',
          muted:    '#9fa0b5',
          text:     '#555663',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'hero':        ['3.5rem',  { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '500' }],
        'hero-mobile': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '500' }],
        'section':     ['2.25rem', { lineHeight: '1.2',  fontWeight: '500' }],
        'section-mobile': ['1.625rem', { lineHeight: '1.2', fontWeight: '500' }],
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up':        'fade-up 0.4s ease both',
        'fade-in':        'fade-in 0.3s ease both',
        'slide-in-left':  'slide-in-left 0.35s ease both',
        'scale-in':       'scale-in 0.3s ease both',
        shimmer:          'shimmer 2s linear infinite',
        marquee:          'marquee 35s linear infinite',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 30px rgba(47,126,218,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        blue:   '0 4px 20px rgba(47,126,218,0.25)',
      },
    },
  },
  plugins: [],
}

export default config
