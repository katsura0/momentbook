var path = require('path');
var webpack = require('webpack');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
    entry: [
        './src/view.js',
        './src/events.js',
        './src/controller.js',
    ],
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'memorybook.min.js',
    },
    mode: 'production',
    optimization: {
        usedExports: false,
    },
    // plugins: [
    //     new CopyPlugin({
    //       patterns: [
    //         { from: "css", to: "dist" },
    //       ],
    //       options: {
    //         concurrency: 100,
    //       },
    //     }),
    //   ],
    // module: {
    //     rules: [
    //         {
    //             test: /\.css$/i,
    //             use: ['style-loader', 'css-loader'],
    //         },
    //         {
    //             test: /\.pug$/,
    //             use: [
    //                 {
    //                     loader: 'html-loader',
    //                     options: { minimize: false }
    //                     // 不壓縮 HTML
    //                 },
    //                 {
    //                     loader: 'pug-html-loader',
    //                     options: { pretty: true }
    //                     // 美化 HTML 的編排 (不壓縮HTML的一種)
    //                 }
    //             ]
    //         },
    //         {
    //             test: /\.(woff|woff2|ttf|otf)$/,
    //             loader: 'file-loader',
    //             options: {
    //                 name: '[name].[ext]',
    //                 outputPath: 'fonts/',
    //             }
    //         },
    //     ],
    // }
    // , plugins: [
    //     new HtmlWebpackPlugin({
    //         template: './pug/index.min.pug',
    //         filename: 'index.min.html',
    //         inject: true,
    //         chunks: ['index.min'],  // 根據 entry 的名字而定
    //         minify: {
    //             sortAttributes: true,
    //             collapseWhitespace: false, // 折疊空白字元就是壓縮Html
    //             collapseBooleanAttributes: true, // 折疊布林值属性，例:readonly checked
    //             removeComments: true, // 移除註釋
    //             removeAttributeQuotes: true // 移除屬性的引號
    //         }
    //     }),
    // ]
}