const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, dir)
}

const dev = process.env.NODE_ENV == 'development'

const config = {
  mode: process.env.NODE_ENV,
  entry: {
    main: resolve('src/index.js'),
  },
  output: {
    path: resolve('dist'),
    filename: 'hyapp-utils.js',
    library: 'hyappUtils',
    libraryTarget: 'umd',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: false,
        terserOptions: {
          compress: {
            drop_console: !dev,
          },
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [],
}
if (!dev) {
  config.plugins.push(new CleanWebpackPlugin())
}
module.exports = config
