const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const glob = require('glob-all');

module.exports = { 
  entry: {
    ...glob
      .sync('./src/static/js/*.js')
      .reduce((entries, file) => {
        const entryName = path.basename(file, '.js');
        entries[entryName] = file;
        return entries;
    }, {}),
    ...glob
      .sync('./src/static/js/*/*.js')
      .reduce((entries, file) => {
        const entryName = path.basename(file, '.js');
        entries[entryName] = file;
        return entries;
    }, {}),
    ...glob
    .sync('./src/static/css/*.css')
    .reduce((entries, file) => {
      const entryName = path.basename(file, '.css');
      entries[entryName] = file;
      return entries;
    }, {}),
    ...glob
    .sync('./src/static/css/*/*.css')
    .reduce((entries, file) => {
      const parentFolder = path.basename(path.dirname(file));
      const fileName = path.basename(file, '.css'); 
      const entryName = `${parentFolder}/${fileName}`;
            
      entries[entryName] = file; 
      return entries;
    }, {}),    
  },  
  output: {
    filename: 'src/static/js/[name].js',
    path: path.resolve(__dirname, 'optimized'),
    iife: false,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [    
      new TerserPlugin({
       terserOptions: {
          compress: false,
          keep_classnames: true,
          keep_fnames: true,
          mangle: false,
        },
      }),  
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'src/static/css/[name].css',
    }),
    ...glob.sync('./templates/*.html').map((htmlFile) => {
      const filename = path.basename(htmlFile);
      return new HtmlWebpackPlugin({
        filename: `templates/${filename}`,
        template: htmlFile,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
          inject: true,
        },  
      });
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.resolve(__dirname, '')}/**/*`, { nodir: true }),
    }), 
  ],
};
