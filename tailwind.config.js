/** @type {import('tailwindcss').Config} */
export default module = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyberblue: '#00ffff',
        cyberpink: '#ff00ff',
        cybergreen: '#00ff00',
        cyberorange: '#ff9900',
        darkbg: '#0a0f1b',
      },
    },
  },
  plugins: [],
};