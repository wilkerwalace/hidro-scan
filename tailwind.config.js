/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        bg: "#FAFAFA",
        surface: "#FFFFFF",
        green: "#76FB91",
        warm: "#FFD66B",
        // Status (classificação de pH)
        ideal: "#5DBE6E",
        ok: "#D6C736",
        acid: "#E0331D",
        base: "#3A3AAE",
        trendUp: "#2EA38E",
        trendDown: "#E0331D",
      },
      fontFamily: {
        light: ["Outfit_300Light"],
        regular: ["Outfit_400Regular"],
        medium: ["Outfit_500Medium"],
        semibold: ["Outfit_600SemiBold"],
      },
      borderRadius: {
        card: "22px",
        glass: "24px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
