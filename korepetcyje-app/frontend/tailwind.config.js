/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

    darkMode: 'class',
    
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  
daisyui: {
    themes: [
      {

       mylight: {
          primary: "#58B09C",
          "primary-content": "#ffffff",

          secondary: "#5D737E",
          "secondary-content": "#ffffff",

          accent: "#30292F",
          "accent-content": "#ffffff",

          neutral: "#3F4045",
          "neutral-content": "#ffffff",

          "base-100": "#FCFCFC",
          "base-200": "#F2F2F2",
          "base-300": "#E5E5E5",
          "base-content": "#02111B",

          info: "#5D737E",
          success: "#58B09C",
          warning: "#F4C95D",
          error: "#E15B64",

          "--rounded-btn": "0.5rem",
          "--rounded-badge": "0.375rem",
          "--animation-btn": "0.25s",
          "--btn-text-case": "none",


        },
      },


      {
        dark: {
          /* BRAND COLORS */
          primary: "#58B09C",
          "primary-content": "#02111B",

          secondary: "#5D737E",
          "secondary-content": "#ffffff",

          accent: "#30292F",
          "accent-content": "#ffffff",

          neutral: "#3F4045",
          "neutral-content": "#F0F4F8",

          "base-100": "#1A232B",
          "base-200": "#161D24",
          "base-300": "#0F151A",
          "base-content": "#F2F6FA",

          info: "#5D737E",
          success: "#58B09C",
          warning: "#F4C95D",
          error: "#E15B64",

          "--rounded-btn": "0.5rem",
          "--rounded-badge": "0.375rem",
          "--animation-btn": "0.25s",
          "--btn-text-case": "none",     

        },
      },

    ],
  },

}