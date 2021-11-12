const path = require('path');
function resolve(dir) {
    return path.resolve(__dirname, dir)
}
var webpack = require('webpack')
module.exports = {
    pages: {
        index: {
            entry: 'src/main.js',
            template: 'public/index.html',
            filename: 'index.html',
        },
    },
    

    productionSourceMap: false,
    configureWebpack: {
        output: {
            libraryExport: 'default'
        },
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
              '@': resolve('src'),
              '_c': resolve('src/components'),
            }
        }, 
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                plupload: "plupload"
            }),
        ],
        module: { //这个节点用于配置所有的第三方模块加载器
          rules: [
            {
                test: /\.vue$/,
                loader: ["vue-loader"],
            },
            {test:/\.js$/, use:'babel-loader'},
            // ,exclude:/node_modules/
          ]
      }
    },
    devServer:{
        port: 8091,
        hot: true,
        open: 'Google Chrome'
    },
    chainWebpack: config => {
        config.module
            .rule('js')
            .include
            .add('/packages')
            .end()
            .use('babel')
            .loader('babel-loader')
            .tap(options => {
                return options
            })
    },
    css: {
        extract: false,
    }
}