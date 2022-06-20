const { merge } = require('webpack-merge');
const path = require('path');


const common = require('./webpack.config.cjs');

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [
        {
            test: /\.tsx?$/,
            use: [
                {
                loader: 'ts-loader',
                options: {
                    configFile: path.resolve(__dirname, 'tsconfig.json'),
                },
                },
            ],
            exclude: /(node_modules)/
        },
    ],
  }
});