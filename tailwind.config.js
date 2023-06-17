const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "520px",
      },
      colors: {
        "almost-black": "rgba(0, 0, 0, .8) !important",
        "club-red": "var(--club-red)",

        black: "hsl(var(--black))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "live-page-player": "url('/lil_buddy_low_res.png')",
      },
      xShadow: {
        "lens-profile-hover": "shadow-[0 0 0 4px #2980b9, 0 0 0 7px #0d293c]",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "fade-in-from-top": {
          from: {
            opacity: 0,
            transform: "translateY(10px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
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
        "move-txt-bg": {
          to: {
            backgroundPosition: "var(--bg-size) 0",
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
        scale: {
          "0%, 100%": {
            transform: "scale(1.0)",
          },
          "50%": {
            transform: "scale(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "move-txt-bg": "move-txt-bg 8s linear infinite",
        "fade-in-and-out-up": "fade-in-and-out-up 2s ease-in-out",
        "fade-in-from-top": "fade-in-from-top 0.5s var(--ease-squish-1) forwards calc(var(--_delay) * 100ms)",
        crash: "crash 6s linear",
        destroy: "destroy 6s",
        scale: "scale 2s infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          "animation-delay": (value) => {
            return {
              "animation-delay": value,
            };
          },
        },
        {
          values: theme("transitionDelay"),
        }
      );
    }),
  ],
};
