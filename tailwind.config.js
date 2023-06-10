const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    experimental: {
        optimizeUniversalDefaults: true,
    },

    darkMode: 'class',

    content: ["./index.html"],

    theme: {
        extend: {
            colors: {
                grayBlue: {
                    DEFAULT: '#353A50',
                    '100': '#EBEBEE',
                    '200': '#CDCED3',
                    '300': '#AEB0B9',
                    '400': '#878EAF',
                    '500': '#353A50',
                    '600': '#2A2F48',
                    '700': '#23273A',
                    '800': '#202330',
                    '900': '#101118',
                },
                orange: {
                    DEFAULT: '#FF9300',
                    '50': '#FFF4E5',
                    '100': '#FFE9CC',
                    '200': '#FFD499',
                    '300': '#FFBE66',
                    '400': '#FFA933',
                    '500': '#FF9300',
                    '600': '#E68400',
                    '700': '#CC7600',
                    '800': '#B36700',
                    '900': '#995800'
                },
            },

            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                mono: ['Fira Code VF', ...defaultTheme.fontFamily.mono],
                source: ['Source Sans Pro', ...defaultTheme.fontFamily.sans],
                'ubuntu-mono': ['Ubuntu Mono', ...defaultTheme.fontFamily.mono],
            },
        },
    },

    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography')
    ],
}
