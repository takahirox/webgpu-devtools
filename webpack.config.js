const path = require('path');

const mode = 'development';

module.exports = [
  {
    devtool: false,
    entry: './src/index.ts',
    mode: mode,
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
  },
  {
    devtool: false,
    entry: './src/extensions/background.ts',
    mode: mode,
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
      filename: 'background.js',
      path: path.resolve(__dirname, 'extensions')
    },
    resolve: {
      extensions: [
        '.js',
        '.ts',
        '.tsx'
      ]
    }
  },
  {
    devtool: false,
    entry: './src/extensions/content-script.ts',
    mode: mode,
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
      filename: 'content-script.js',
      path: path.resolve(__dirname, 'extensions')
    },
    resolve: {
      extensions: [
        '.js',
        '.ts',
        '.tsx'
      ]
    }
  },
  {
    devtool: false,
    entry: './src/extensions/panel.ts',
    mode: mode,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        }
      ]
    },
    output: {
      filename: 'panel.js',
      path: path.resolve(__dirname, 'extensions')
    },
    resolve: {
      extensions: [
        '.js',
        '.ts',
        '.tsx'
      ]
    }
  }
];