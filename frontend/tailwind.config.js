/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0c2340',     // Deep Indian institutional navy
          navylight: '#163b6b',
          blue: '#1a4f8b',     // Institutional interaction blue
          hover: '#091c33',
          border: '#cbd5e1',   // Hairline neutral gray
          borderdark: '#94a3b8',
          bg: '#f8fafc',       // Muted background
          surface: '#ffffff',  // Clean white
          text: '#0f172a',     // Slate-900 high contrast text
          muted: '#475569',    // Slate-600
          lightmuted: '#64748b',
          accent: '#b45309',   // Deep amber/brass accent
        },
        sovereign: {
          navy: '#0c2340',
          brass: '#b45309',
          green: '#15803d',
          bg: '#f8fafc',
        },
      },
      borderRadius: {
        'none': '0',
        'xs': '2px',
        'sm': '3px',
        'DEFAULT': '4px',
        'md': '4px',
        'lg': '6px',
        'xl': '8px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },
    },
  },
  plugins: [],
}
