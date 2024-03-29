const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionPlugin = require("compression-webpack-plugin")

const env = 'production'

function resolve (dir) {
  return path.join(__dirname, '/', dir)
}

let rules = [
  {
    test: /\.js$/,
    loader: 'babel-loader',
    include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
  },
  {
    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    loader: 'url-loader',
    options: {
      limit: 10000,
      name: './dist/img/[name].[hash:7].[ext]'
    }
  },
  {
    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
    loader: 'url-loader',
    options: {
      limit: 10000,
      name: './dist/media/[name].[hash:7].[ext]'
    }
  },
  {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    loader: 'url-loader',
    options: {
      limit: 10000,
      name: './dist/fonts/[name].[hash:7].[ext]'
    }
  },
  {
    test: /\.(less|css)$/,
    use: [
      { loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' } },
      { loader: 'css-loader', options: { sourceMap: true, importLoaders: 2 } },
      { loader: 'postcss-loader', options: { sourceMap: true } },
      { loader: 'less-loader', options: { sourceMap: true } }
    ]
  }
]

const webpackConfig = {
  mode: 'production',
  entry: {
    'yeldaWebchatInjector': path.resolve(__dirname, './src/js/yeldaWebchatInjector.js'),
    'yeldaWebchatInjector.min': path.resolve(__dirname, './src/js/yeldaWebchatInjector.js')
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'js/[name].js',
    libraryExport: 'default',
    libraryTarget: 'umd',
    library: 'YeldaChat',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  optimization: {
    minimize: true
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': resolve('src')
    }
  },
  module: {
    rules: rules
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new MiniCssExtractPlugin({
      filename: 'css/yeldaWebchatInjector.css',
      chunkFilename: '[id].css',
      minimize: false,
      outputStyle: 'expanded'
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/yeldaWebchatInjector.min.css',
      chunkFilename: '[id].css'
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJsPlugin({
      sourceMap: true,
      parallel: true
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      minRatio: 0.8,
      test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
      threshold: 10240
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /yeldaWebchatInjector\.css$/
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /yeldaWebchatInjector\.min\.css$/
    })
  ]
}

module.exports = webpackConfig
