var webpack = require('webpack');
const path = require('path');
function resolve(dir) {
  return path.resolve(__dirname, dir);
}

const BASE_URL = process.env.NODE_ENV === 'production' ? '../../' : '';

module.exports = {
  //   publicPath: BASE_URL,
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
    },
  },
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': resolve('src'),
        _c: resolve('src/components'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        plupload: 'plupload',
      }),
    ],
  },
  // 如果你不需要使用eslint，把lintOnSave设为false即可
  lintOnSave: false,
  // 打包时不生成.map文件
  productionSourceMap: false,
  // chainWebpack: config => {
  //     config.module
  //         .rule('js')
  //         .include
  //         .add('/packages')
  //         .end()
  //         .use('babel')
  //         .loader('babel-loader')
  //         .tap(options => {
  //             return options
  //         })
  // },
  chainWebpack: (config) => {
    config.module
      .rule('js')
      .include.add(resolve('src'))
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap((options) => {
        return options;
      });
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'));
  },
  css: {
    extract: false,
  },
};
