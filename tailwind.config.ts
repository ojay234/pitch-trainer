// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {

      colors: {
        "primary": "#0df259",
        "background-light": "#f5f8f6",
        "background-dark": "#102216",
        "surface-light": "#ffffff",
        "surface-dark": "#1a2e22",
      },

    },
  },
  plugins: [],
}

