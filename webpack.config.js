"use strict";

let path = require('path');

module.exports = {
  context: __dirname,

  entry: './js/index.jsx',

  output: {
    path: path.resolve('./assets'),
    filename: 'index.js'
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['stage-0', 'react']
          }
        }]
      }
    ]
  }
};
