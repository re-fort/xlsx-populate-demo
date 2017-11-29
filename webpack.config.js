module.exports = {
  entry: `./src/app.js`,
  output: {
    filename: './dist/app.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  node: {
    fs: 'empty',
  },
}