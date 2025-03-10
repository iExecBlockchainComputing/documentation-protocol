/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./components/**/*.vue'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        success: 'var(--success)',
        'on-bg-success': 'var(--on-bg-success)',
      },
    },
  },
  plugins: [],
};
