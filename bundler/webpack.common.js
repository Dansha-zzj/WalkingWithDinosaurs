const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
    entry: 
    {
        'Phanerozoic': path.resolve(__dirname, '../src/main.js'),
        'about': path.resolve(__dirname, '../src/about.js'),
        'feedback': path.resolve(__dirname, '../src/feedback.js'),
        'cop26': path.resolve(__dirname, '../src/cop26.js'),
        'dune': path.resolve(__dirname, '../src/dune.js'),
        'wot': path.resolve(__dirname, '../src/wot.js'),
        'nextMillion': path.resolve(__dirname, '../src/nextMillion.js'),
      },
      
    output:
    {
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins:
    [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../assets') }
            ]
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../index.html'),
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            },
            chunks: ['Phanerozoic'],
            filename: 'index.html'
            // minify: false
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../pages/about.html'),
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            },
            filename: 'about.html',
            chunks: ['about']
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../pages/feedback.html'),
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            },
            filename: 'feedback.html',
            chunks: ['feedback']
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../pages/cop26.html'),
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            },
            filename: 'cop26.html',
            chunks: ['cop26']
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../pages/dune.html'),
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            },
            filename: 'dune.html',
            chunks: ['dune']
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../pages/wot.html'),
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            },
            filename: 'wot.html',
            chunks: ['wot']
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../pages/nextMillion.html'),
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            },
            filename: 'nextMillion.html',
            chunks: ['nextMillion']
        }),
    ],
    module:
    {
        rules:
        [
            // Shaders
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader'
                ]
            },
            
            // CSS
            {
                test: /\.css$/,
                use:
                [
                    'style-loader',
                    'css-loader'
                ]
            },
            
            // Models
            {
                test: /\.(glb|gltf)$/,
                use:
                [
                    {
                        loader: 'file-loader',
                        options:
                        {
                            outputPath: 'assets/models/'
                        }
                    }
                ]
            },
            // CSV
            {
                test: /\.(txt|csv|mmdb)$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {
                      name: "[path][name].[ext]",
                      emitFile: true,
                    },
                  },
                ],
              },     
        ]
    }
}
