/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#041534",
        "primary-container": "#1b2a4a",
        "on-primary": "#ffffff",
        "on-primary-container": "#8392b7",
        "primary-fixed": "#d9e2ff",
        "primary-fixed-dim": "#b7c6ee",
        "on-primary-fixed": "#0a1a3a",
        "on-primary-fixed-variant": "#384668",
        "inverse-primary": "#b7c6ee",

        "secondary": "#795900",
        "secondary-container": "#ffc641",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#715300",
        "secondary-fixed": "#ffdfa0",
        "secondary-fixed-dim": "#f6be39",
        "on-secondary-fixed": "#261a00",
        "on-secondary-fixed-variant": "#5c4300",

        "surface": "#f8f9ff",
        "surface-bright": "#f8f9ff",
        "surface-dim": "#ccdbf4",
        "surface-variant": "#d4e4fc",
        "surface-container": "#e5eeff",
        "surface-container-low": "#eff4ff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d4e4fc",
        "surface-container-lowest": "#ffffff",
        "surface-tint": "#4f5e81",
        "inverse-surface": "#223144",
        "inverse-on-surface": "#eaf1ff",

        "background": "#f8f9ff",
        "on-background": "#0d1c2e",
        "on-surface": "#0d1c2e",
        "on-surface-variant": "#45464e",

        "outline": "#75777f",
        "outline-variant": "#c5c6cf",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        "tertiary": "#211300",
        "tertiary-container": "#3c2600",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#ae8c5b",
        "tertiary-fixed": "#ffddb0",
        "tertiary-fixed-dim": "#e7c08b",
        "on-tertiary-fixed": "#281800",
        "on-tertiary-fixed-variant": "#5c4218"
      },
      fontFamily: {
        "display": ["Epilogue", "sans-serif"],
        "headline-lg": ["Epilogue", "sans-serif"],
        "headline-md": ["Epilogue", "sans-serif"],
        "headline-sm": ["Epilogue", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-lg": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "bookman": ["'Bookman Old Style'", "Bookman", "'URW Bookman L'", "serif"]
      }
    },
  },
  plugins: [],
}

