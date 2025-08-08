module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        'iOS >= 12',
        'Safari >= 12',
        '> 1%',
        'last 2 versions'
      ]
    },
  },
}