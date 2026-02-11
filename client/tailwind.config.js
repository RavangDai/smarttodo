/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a', // Deep black-gray
                surface: '#121212',    // Slightly lighter
                primary: '#FF6B35',    // Vibrant Orange
                secondary: '#A1A1AA',  // Muted gray text
                accent: '#F97316',     // Orange-500
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
                mono: ['"Space Mono"', 'monospace'],
                body: ['"Crimson Pro"', 'serif'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'neon': '0 0 10px rgba(255, 107, 53, 0.5), 0 0 20px rgba(255, 107, 53, 0.3)',
            },
        },
    },
    plugins: [],
}
