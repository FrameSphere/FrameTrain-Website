/** @type {import('tailwindcss').Config} */

// Design-System „Neuron" (V2): jede Farbe kommt aus einer CSS-Variable in
// globals.css – so schalten Night/Day über data-theme um, ohne dass im
// Markup ein einziger Hex-Wert steht.
const token = (name) => `var(--${name})`

const neuronColors = [
  'bg', 'surface', 'surface-raised', 'line', 'line-strong',
  'ink', 'ink-muted', 'ink-faint',
  'indigo', 'indigo-button', 'indigo-hover', 'on-indigo', 'on-indigo-muted', 'indigo-text', 'indigo-soft',
  'output', 'on-output', 'output-text', 'output-soft',
  'ghost-fill', 'ghost-edge', 'glass-fill', 'glass-edge',
  'success', 'warning', 'danger', 'chart-grid',
].reduce((acc, name) => ({ ...acc, [name]: token(name) }), {})

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ...neuronColors,
      },
      // ring-* ohne Farbe fiele sonst auf Tailwinds Blau zurück
      ringColor: {
        DEFAULT: 'var(--line-strong)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        island: 'var(--radius-island)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        island: 'var(--shadow-island)',
        window: 'var(--shadow-window)',
        'button-edge': 'var(--shadow-button-edge)',
      },
      maxWidth: {
        content: '1120px',
      },
    },
  },
  plugins: [],
}
