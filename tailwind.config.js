/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark base colors
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a25',
          600: '#22222f',
          500: '#2a2a3a',
          400: '#3a3a4f',
          300: '#4a4a65',
        },
        // Neon colors
        neon: {
          cyan: '#00f5ff',
          cyanDark: '#00c4cc',
          pink: '#ff00ff',
          pinkDark: '#cc00cc',
          purple: '#bf00ff',
          green: '#00ff88',
          greenDark: '#00cc6a',
          yellow: '#ffff00',
          orange: '#ff8800',
          red: '#ff0055',
          blue: '#0088ff',
        },
        // Glow effects (same colors but for reference)
        glow: {
          cyan: '0 0 10px #00f5ff, 0 0 20px #00f5ff, 0 0 30px #00f5ff',
          pink: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff',
          purple: '0 0 10px #bf00ff, 0 0 20px #bf00ff, 0 0 30px #bf00ff',
          green: '0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00f5ff, 0 0 10px #00f5ff, 0 0 15px #00f5ff',
        'neon-pink': '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff',
        'neon-purple': '0 0 5px #bf00ff, 0 0 10px #bf00ff, 0 0 15px #bf00ff',
        'neon-green': '0 0 5px #00ff88, 0 0 10px #00ff88, 0 0 15px #00ff88',
        'neon-blue': '0 0 5px #0088ff, 0 0 10px #0088ff, 0 0 15px #0088ff',
        'neon-red': '0 0 5px #ff0055, 0 0 10px #ff0055, 0 0 15px #ff0055',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 245, 255, 0.1)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 2px rgba(0, 245, 255, 0.2)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'glow': {
          '0%': { filter: 'brightness(1)' },
          '100%': { filter: 'brightness(1.2)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, #00f5ff 0%, #bf00ff 50%, #ff00ff 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      }
    },
  },
  plugins: [],
}
