const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    filename: 'dev.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
});