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
                    bg: '#550C18',
                    terracotta: '#D86A33',
                    peach: '#FFC99C',
                    wine: '#550C18',
                    'wine-dark': '#3d0710',
                    'wine-card': '#5e0f1d',
                    'wine-card-hover': '#6f1423',
                    'orange-dark': '#D86A33',
                    'orange-light': '#FFC99C',
                    orange: '#D86A33',
                    white: '#550C18'
                }
            }
        },
    },
    plugins: [],
}