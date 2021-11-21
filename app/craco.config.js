module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        require('@tailwindcss/forms')
      ],
    },
  },
}
