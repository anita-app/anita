const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.tsx'
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      rose: colors.rose,
      pink: colors.pink,
      fuchsia: colors.fuchsia,
      purple: colors.purple,
      violet: colors.violet,
      indigo: colors.indigo,
      blue: colors.blue,
      'prussian-blue': {
        DEFAULT: '#002346',
        '50': '#2D96FF',
        '100': '#1389FF',
        '200': '#006FDF',
        '300': '#0056AC',
        '400': '#003C79',
        '500': '#002346',
        '600': '#002346',
        '700': '#000f20',
        '800': '#000e1f',
        '900': '#000d1b'
      },
      sky: colors.sky,
      cyan: colors.cyan,
      teal: colors.teal,
      emerald: colors.emerald,
      green: colors.green,
      lime: colors.lime,
      yellow: colors.yellow,
      amber: colors.amber,
      orange: colors.orange,
      red: colors.red,
      stone: colors.stone,
      neutral: colors.neutral,
      gray: colors.gray,
      gray: colors.gray,
      slate: colors.slate
    }
  },
  variants: {
    extend: {
      tableLayout: ['hover', 'focus']
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}