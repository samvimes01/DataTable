const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');

const CleanWebpackPlugin = require('clean-webpack-plugin');
// const DelWebpackPlugin = require('del-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/js/main.js',
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, './public/'),
  },

  devtool: 'source-map',

  plugins: [
    new CleanWebpackPlugin(['public/*.js']),
    // new DelWebpackPlugin({
    //   include: ['**.js'],
    //   // exclude: ['./img'],
    //   info: false,
    //   keepGeneratedAssets: true,
    //   allowExternal: false,
    // }),
    new HtmlWebpackPlugin({
      title: 'DataTable',
      template: './src/index.html',
    }),
    // new CopyWebpackPlugin([
    //     { from: './src/style.css', to: './style.css' },
    //     { from: './src/img', to: './img' },
    //   ],
    //   { debug: 'debug' }
    // )
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-transform-runtime'],
          },
        },
      },
    ],
  },

  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: 9000,
  },
};
