const { plugin } = require('twrnc');

module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#0077cc',
          dark: '#005299',
        },
        secondary: {
          light: '#ffca80',
          DEFAULT: '#ff9e2c',
          dark: '#e68a00',
        },
        background: {
          light: '#f8f9fa',
          DEFAULT: '#f1f3f5',
          dark: '#e9ecef',
        },
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
        heading: ['System-Bold', 'sans-serif'],
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        'card': {
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 16,
          marginVertical: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
        'card-expanded': {
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 16,
          marginVertical: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        },
        'dark-card': {
          backgroundColor: '#1E1E1E',
          borderRadius: 8,
          padding: 16,
          marginVertical: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 2,
          borderWidth: 1,
          borderColor: '#333333',
        },
        'dark-card-expanded': {
          backgroundColor: '#1E1E1E',
          borderRadius: 8,
          padding: 16,
          marginVertical: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1,
          borderColor: '#333333',
        },
      });
    }),
  ],
};
