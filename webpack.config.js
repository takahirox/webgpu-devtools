const path = require('path');

module.exports = {
  devtool: false,
  entry: './src/index.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  output: {
    filename: 'webgpu-devtools.bundle.js',
    path: path.resolve(__dirname, 'extensions')
  },
  resolve: {
    extensions: [
      '.js',
      '.ts',
      '.tsx'
    ]
  }
};