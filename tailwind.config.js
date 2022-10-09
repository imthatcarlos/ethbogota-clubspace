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
        crash: {
          "0%": {
            translate: "-100vw",
          },
          "50%": {
            translate: "0",
          },
        },
        destroy: {
          "50%": {
            translate: "0",
            transform: "scale(1)",
            transitionTimingFunction: "cubic-bezier(0,0,0.2,1)",
            color: "red",
          },
          "60%": {
            translateY: "0 -60vh",
            transform: "scale(1.4)",
          },
          "80%": {
            translateY: "0 30vh",
            transform: "scale(0.8)",
          },
          "100%": {
            translateY: "0 0vh",
            transform: "scale(1)",
          },
        },
      },
      animation: {
        "fade-in-and-out-up": "fade-in-and-out-up 2s ease-in-out",
        crash: "crash 6s linear",
        destroy: "destroy 6s",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
