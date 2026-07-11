/**
 * Tailwind config — paleta "Lavanda claro" (tema claro pastel).
 * Los nombres de token se conservan; sólo cambian los valores, así que el
 * re-tema fluye a toda la app. Colores foreground con contraste suficiente
 * sobre fondo claro (legibilidad AA); versiones pálidas via opacidad para fondos.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Fondos / superficies
        background: '#f4f3fb',
        'surface-dim': '#f4f3fb',
        surface: '#ffffff',
        'surface-bright': '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#faf9fe',
        'surface-container': '#efedf9',
        'surface-container-high': '#e7e4f4',
        'surface-container-highest': '#ddd9ee',
        'surface-variant': '#e7e4f4',
        // Texto
        'on-background': '#2c2a3d',
        'on-surface': '#2c2a3d',
        'on-surface-variant': '#55536b',
        outline: '#78748f',
        'outline-variant': '#d7d3e8',
        inverse: '#ffffff',
        'inverse-surface': '#2c2a3d',
        'inverse-on-surface': '#f4f3fb',
        // Primario (lavanda)
        primary: '#6d5ce0',
        'primary-fixed': '#6d5ce0',
        'primary-fixed-dim': '#7c6cf0',
        'primary-container': '#6d5ce0',
        'on-primary': '#ffffff',
        'on-primary-container': '#ffffff',
        'on-primary-fixed': '#241a66',
        'on-primary-fixed-variant': '#4a3fb0',
        'inverse-primary': '#c9c0fb',
        'surface-tint': '#6d5ce0',
        // Secundario / positivo (menta)
        secondary: '#2f9e75',
        'secondary-fixed': '#2f9e75',
        'secondary-fixed-dim': '#38a97e',
        'secondary-container': '#cdeede',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#14603f',
        'on-secondary-fixed': '#053824',
        'on-secondary-fixed-variant': '#14603f',
        // Error / negativo (rosa)
        error: '#d76a6a',
        'error-container': '#f8dada',
        'on-error': '#ffffff',
        'on-error-container': '#7a2020',
        // Terciario (durazno) — acentos menores
        tertiary: '#e0915f',
        'tertiary-container': '#fbe0cd',
        'tertiary-fixed': '#fbe0cd',
        'tertiary-fixed-dim': '#f2b48c',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#7a3a12',
        'on-tertiary-fixed': '#3a1a06',
        'on-tertiary-fixed-variant': '#7a3a12',
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '1rem',
        pill: '9999px',
      },
      spacing: {
        'container-max': '1440px',
        'margin-desktop': '40px',
        gutter: '24px',
        unit: '4px',
        'margin-mobile': '16px',
      },
      maxWidth: {
        'container-max': '1440px',
      },
      fontFamily: {
        'headline-md': ['var(--font-sora)', 'Sora', 'sans-serif'],
        'display-lg': ['var(--font-sora)', 'Sora', 'sans-serif'],
        'headline-lg': ['var(--font-sora)', 'Sora', 'sans-serif'],
        'body-lg': ['var(--font-hanken)', 'Hanken Grotesk', 'sans-serif'],
        'body-md': ['var(--font-hanken)', 'Hanken Grotesk', 'sans-serif'],
        'data-mono': ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        'label-caps': ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '500' }],
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'data-mono': ['14px', { lineHeight: '20px', letterSpacing: '0.03em', fontWeight: '500' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '700' }],
      },
      keyframes: {
        scan: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.02)' },
        },
      },
      animation: {
        scan: 'scan 3s linear infinite',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
