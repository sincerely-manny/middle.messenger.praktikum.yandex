const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');


module.exports = {
  mode: 'development',
  entry: './src/script.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[hash].js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true,
  },
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
      {
        test: /\.(tbt|html)$/i,
        loader: 'html-loader',
      },
      { 
        test: /\.less$/,
        use: [ 
            MiniCssExtractPlugin.loader,
            'css-loader', 
            'less-loader'
        ],
      },
    ]
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        parallel: true,
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    ],
    minimize: true,
  },
  plugins: [
    new CleanWebpackPlugin({
      protectWebpackAssets: false,
      verbose: true,
      dry: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          context: path.resolve(__dirname, 'static', 'img'),
          to: './img',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: 'static/index.html',
      filename: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'style-[hash].css',
    }),
  ],
}; 