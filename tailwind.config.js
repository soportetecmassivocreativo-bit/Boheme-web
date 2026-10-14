/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/ui/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    bg: '#5F2142',
                    terracotta: '#D86A33',
                    peach: '#FFC99C',
                    wine: '#5F2142',
                    'wine-dark': '#43142e',
                    'wine-card': '#6f274e',
                    'wine-card-hover': '#7e2d59',
                    'orange-dark': '#D86A33',
                    'orange-light': '#FFC99C',
                    orange: '#D86A33',
                    white: '#5F2142'
                }
            }
        },
    },
    plugins: [],
}