import { Configuration } from 'webpack';
import path from 'path';

const config: Configuration = {
  entry: ['react-hot-loader/patch', './src'],
  output: {
    path: path.resolve('public/dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: 'babel-loader',
      },
    ],
  },
  devServer: {
    contentBase: path.resolve('public'),
    compress: true,
    port: 9000,
    index: 'index.html',
    publicPath: '/dist/',
    open: true,
  },
};

export default config;
