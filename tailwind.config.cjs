/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      void: '#070d19', surface: '#111d30', line: '#2c4159',
      aurora: '#5fe8dc', gold: '#dcb981', mist: '#9db2c9',
    },
    fontFamily: { sans: ['Cairo','Tajawal','system-ui','sans-serif'] },
    boxShadow: { glow: '0 0 60px -25px rgba(95,232,220,.38)' },
  }},
  plugins: [],
};
