const { merge } = require('webpack-merge');
const path = require('path');


const common = require('./webpack.config.cjs');

module.exports = merge(common, {
  mode: 'production',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
      watch: false,
      serveIndex: false,
    },
    compress: true,
    port: process.env.PORT,
    historyApiFallback: true,
    allowedHosts: ['practicum-messenger-sm.herokuapp.com'],
    client: {
      logging: 'none',
      overlay: false,
      progress: false,
    },
    liveReload: false,
    hot: false,
    magicHtml: false,
    port: process.env.PORT || 8080,

  },
});