const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src', 'js', 'main.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: path.join('js', 'calendar.bundle.min.js'),
        libraryTarget: 'umd',
        globalObject: 'this',
        libraryExport: 'default',
        clean: true
    },
    plugins: [
        new HtmlPlugin({
            template: path.resolve(__dirname, "src", "test.html"),
            inject: 'body'
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: true,
            }),
        ],
    },
    devServer: {
        watchFiles: path.join(__dirname, 'dist'),
        port: 3000,
        open: true
    },
    watchOptions: {
        ignored: /node_modules/,
        poll: 1000
    },
};