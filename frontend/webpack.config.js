const path = require('path');

module.exports = {
  entry: './src/index.js', // Update this path to your entry file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devtool: 'source-map', // Use source-map instead of eval
  resolve: {
    fallback: {
      fs: false,
      path: false,
    },
  },
  mode: 'production', // Make sure the mode is set to 'production' for Chrome extensions
};
