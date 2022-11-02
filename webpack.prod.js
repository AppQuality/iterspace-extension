const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const DotenvPlugin = require('dotenv-webpack');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new DotenvPlugin({
      path: './.env.production',
    }),
  ],
  devtool: 'source-map',
});