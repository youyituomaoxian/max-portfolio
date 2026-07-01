export default {
  content: ['./index.html', './admin.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B00',
          'orange-light': '#FF8A33',
          'orange-glow': 'rgba(255,107,0,0.35)',
        },
        surface: {
          base: '#0A0A0A',
          card: '#141414',
          'card-hover': '#1A1A1A',
          border: 'rgba(255,255,255,0.08)',
          glass: 'rgba(10,10,10,0.75)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#999999',
          muted: '#666666',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(3.5rem, 7vw, 7rem)', { lineHeight: '0.9', letterSpacing: '-0.03em', fontWeight: '700' }],
        'hero-sub': ['clamp(1rem, 1.5vw, 1.25rem)', { lineHeight: '1.6', letterSpacing: '0.02em' }],
        'section-title': ['clamp(2.5rem, 5vw, 5rem)', { lineHeight: '1.0', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      spacing: {
        'section': 'clamp(5rem, 10vw, 10rem)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,107,0,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(255,107,0,0.4)' },
        },
      },
    },
  },
  plugins: [],
}
