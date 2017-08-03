const webpack = require('webpack');

// Hack for Ubuntu on Windows: interface enumeration fails with EINVAL, so return empty.
// see https://github.com/Microsoft/BashOnWindows/issues/468#issuecomment-247684647
try {
  require('os').networkInterfaces()
} catch (e) {
  require('os').networkInterfaces = () => ({})
}

module.exports = {
  entry: [`${__dirname}/src/index.js`, `${__dirname}/src/main.less`],
  output: {
    path: `${__dirname}/build`,
    publicPath: '/build/',
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.(css|less)$/, loader: "style-loader!css-loader!less-loader"},
      { test: /\.(png|jpg)$/, loader: 'file-loader'},
    ],
  },

  plugins: process.argv.indexOf('-p') === -1 ? [] : [
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false,
      },
    }),
  ],
};
