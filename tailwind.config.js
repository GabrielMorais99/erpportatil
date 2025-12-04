/** @type {import('tailwindcss').Config} */
module.exports = {
  // Desabilitar dark mode automático do Tailwind
  // O projeto usa body.dark-mode para controlar o tema
  // Padrão: tema branco (sem dark mode ativo)
  darkMode: false,
  content: [
    "./*.html",
    "./js/**/*.js",
    "./api/**/*.js"
  ],
  theme: {
    extend: {
      // Cores primárias do projeto
      colors: {
        'primary-red': '#dc3545',
        'primary-red-dark': '#c82333',
        'primary-red-light': '#e85563',
        'primary-blue': '#007bff',
        'primary-blue-dark': '#0056b3',
        'primary-blue-light': '#4da3ff',
        'cinza-back': '#ebebeb',
        'light-gray': '#f8f9fa',
        'gray': {
          50: '#fafbfc',
          100: '#f5f6f7',
          200: '#e9ecef',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        'dark-gray': '#343a40',
        'border-color': '#dee2e6',
      },
      // Usar variáveis CSS existentes
      backgroundColor: {
        'primary': 'var(--primary-color)',
        'primary-dark': 'var(--primary-color-dark)',
        'primary-light': 'var(--primary-color-light)',
      },
      textColor: {
        'primary': 'var(--primary-color)',
        'primary-dark': 'var(--primary-color-dark)',
        'primary-light': 'var(--primary-color-light)',
      },
      borderColor: {
        'primary': 'var(--primary-color)',
        'primary-dark': 'var(--primary-color-dark)',
        'primary-light': 'var(--primary-color-light)',
      },
      // Sombras do projeto
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
      // Border radius do projeto
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      // Transições do projeto
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Fonte do projeto
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Importante: não sobrescrever estilos existentes
  corePlugins: {
    preflight: false, // Desabilita reset CSS do Tailwind para não conflitar
  },
}

