/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        "fade-in-and-out-up": {
          "0%": {
            opacity: 0,
            transform: "translateY(10px)",
          },
          "50%": {
            opacity: 1,
            transform: "translateY(0)",
          },
          "80%": {
            opacity: 1,
            transform: "translateY(-5px)",
          },
          "100%": {
            opacity: 0,
            transform: "translateY(-10px)",
          },
        },
      },
      animation: {
        "fade-in-and-out-up": "fade-in-and-out-up 2s ease-in-out",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
