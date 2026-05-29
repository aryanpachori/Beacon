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
          teal: '#35858E',
          sage: '#7DA78C',
          'sage-light': '#C2D099',
          cream: '#E6EEC9',
          card: '#F4F8EC',
          nav: '#1C3B38',
          page: '#F0F5E8',
          forest: '#2A5C52',
          text: '#1C3B38',
          muted: '#7DA78C',
          hint: '#9BB8A0',
          border: '#D4E0C8',
          'border-mid': '#C2D099',
          healthy: '#35858E',
          watch: '#4A7A30',
          risk: '#C47820',
          critical: '#C03030',
          danger: '#E05252',
          warning: '#E8963A',
          m: {
            text: '#1C3B38',
            muted: '#7DA78C',
            border: '#D4E0C8',
          },
        },
        /* App shell — same light palette as marketing */
        dash: {
          critical: '#C03030',
          risk: '#C47820',
          watch: '#4A7A30',
          healthy: '#35858E',
          bg: '#F0F5E8',
          surface: '#F4F8EC',
          border: '#D4E0C8',
          muted: '#7DA78C',
          text: '#1C3B38',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '500' }],
        'hero-mobile': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '500' }],
        'section': ['2.25rem', { lineHeight: '1.2', fontWeight: '500' }],
        'section-mobile': ['1.625rem', { lineHeight: '1.2', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}

export default config
