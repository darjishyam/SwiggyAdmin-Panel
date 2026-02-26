/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#FC8019", // Swiggy Orange
                secondary: "#2B1E16",
                dark: "#0f0f0f",
                card: "rgba(255, 255, 255, 0.05)",
            },
        },
    },
    plugins: [],
}
