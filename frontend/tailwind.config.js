/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#667eea",
        "primary-dark": "#5568d3",
        secondary: "#f5576c",
        success: "#4facfe",
        warning: "#fa709a",
        error: "#ef4444",
        "light-bg": "#f5f5f5",
      },
      textColor: {
        primary: "#667eea",
        secondary: "#f5576c",
        success: "#4facfe",
        warning: "#fa709a",
        error: "#ef4444",
        dark: "#1a1a1a",
        light: "#333333",
        muted: "#666666",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#667eea",
          "primary-content": "#ffffff",
          "secondary": "#f5576c",
          "secondary-content": "#ffffff",
          "accent": "#4facfe",
          "accent-content": "#ffffff",
          "neutral": "#3d3d3d",
          "neutral-content": "#f9fafb",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f0f0f0",
          "base-content": "#1a1a1a",
          "info": "#667eea",
          "success": "#4facfe",
          "warning": "#fa709a",
          "error": "#ef4444",
        },
      },
    ],
    defaultTheme: "light",
  },
}

