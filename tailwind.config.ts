import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    // darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                'bl-blue': '#1D6CAC',
                'bl-yellow': '#E2DF6A',
                'bl-red': '#CB1F4C',
            },
            height: {
                '90vh': "90vh",
                '90per': "90%"
            },
            keyframes: {
                fadeIn: {
                    '0%': { transform: "translate(0px, 100px)", opacity: "0" },
                    '100%': { transform: "translate(0px, 0)", opacity: "1" },
                }
            },
            animation: {
                'slide-up': 'fadeIn 3s ease-in 1s ',
                'slide-up-3': 'fadeIn 3s ease-in 3s ',
            }
        },
    },
    plugins: [],
}
export default config
