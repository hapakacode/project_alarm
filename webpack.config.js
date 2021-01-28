const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "production", 
    entry: ['./src/main.js'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'src/main.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test:/\.(png|jpg|gif)$/,
                use : [
                {
                    loader:'url-loader',
                    options:{
                        limit:8192,
                        fallback:require.resolve('file-loader')
                    }
                }
                ]
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg|)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                {
                    loader: 'file-loader',
                    options: {
                    name: '[name].[ext]',
                    outputPath: 'font/'
                    }
                }
                ]
            },
            {
                test: /\.(ogg|mp3|wav|mpe?g)$/,
                loader: 'file-loader',
                options: {
                name: '[path][name].[ext]',
                }
            }
            
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'index.html' })
    ],
    devServer: {
        port: 9000,
    },
    performance: {
        hints: "warning", 
        maxAssetSize: 200000, 
        maxEntrypointSize: 400000, 
        assetFilter: function(assetFilename) {
        return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
        }
    },

};