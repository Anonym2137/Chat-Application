/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // path to your source directory
    './components/**/*.{js,jsx,ts,tsx}', // components folder
    './node_modules/@shadcn/ui/**/*.js', // shadcn/ui components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

