const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CompressionPlugin = require("compression-webpack-plugin")

const env = 'production'

function resolve (dir) {
  return path.join(__dirname, '/', dir)
}

let rules = [
  {
    test: /\.js$/,
    loader: 'babel-loader',
    include: [resolve('src'), resolve('test')]
  },
  {
    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    type: 'asset',
    parser: { dataUrlCondition: { maxSize: 10000 } },
    generator: { filename: 'img/[name].[hash:7][ext]' }
  },
  {
    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
    type: 'asset',
    parser: { dataUrlCondition: { maxSize: 10000 } },
    generator: { filename: 'media/[name].[hash:7][ext]' }
  },
  {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    type: 'asset',
    parser: { dataUrlCondition: { maxSize: 10000 } },
    generator: { filename: 'fonts/[name].[hash:7][ext]' }
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
    umdNamedDefine: true,
    // window in a browser, even when the bundle is wrapped in a strict mode function where `this` is undefined.
    // The tests load the UMD bundle in Node, where `self` is not defined
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  devtool: 'source-map',
  optimization: {
    minimize: true,
    // Both bundles are minified, as they were with webpack 4: the .min files hold the same code
    // The license comments stay in the bundles instead of separate .LICENSE.txt files, so dist keeps the same files
    minimizer: [new TerserPlugin({ parallel: true, extractComments: false }), new CssMinimizerPlugin()]
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
    // One CSS file per entry: css/yeldaWebchatInjector.css and css/yeldaWebchatInjector.min.css
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: '[id].css'
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
