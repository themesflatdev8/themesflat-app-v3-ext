const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = env => {
    let isProd = env.production || env.development || env.local ? true : false
    return {
        mode: isProd ? 'production' : 'development',
        // devtool: isProd ? 'source-map' : 'cheap-module-source-map',
        // devtool: 'cheap-source-map',
        optimization: {
            usedExports: true,
            minimize: true,
        },
        // performance: {
        //     hints: false
        // },
        entry: {
            'msell': [
                './src/modules/core/index.js',
                './src/styles/modules/core/index.scss'
            ],
            'product-bundles': [
                './src/modules/product-bundles/index.js',
                './src/styles/modules/product-bundles/index.scss'
            ],
            'volume-discounts': [
                './src/modules/volume-discounts/index.js',
                './src/styles/modules/volume-discounts/index.scss'
            ]
        },
        output: {
            filename: '[name].js',
            chunkFilename: '[name].[hash].js',
            path: path.resolve(__dirname, '../extensions/theme-app-extension/assets'),
        },
        // optimization: {
        //     splitChunks: {
        //         chunks: 'all',
        //     },
        // },
        devServer: {
            port: 20001,
            webSocketServer: false
        },
        plugins: [
            new CleanWebpackPlugin({
                protectWebpackAssets: false,
                cleanAfterEveryBuildPatterns: ['*.LICENSE.txt'],
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css'
            }),
            new CopyPlugin({
                patterns: [
                    { from:'src/assets/images', to:'' }
                ],
            }),
            new Dotenv({
                path: `./.env${env.production ? '.production' : (env.development ? '.development' : '')}`
            }),
            new ESLintPlugin({
                extensions: ['js'], // Kiểm tra file .js
                emitWarning: true,  // Báo lỗi dưới dạng cảnh báo
                failOnError: true   // Ngăn build nếu gặp lỗi
            })
        ],
        resolve: {
            modules: [
                "node_modules"
            ],
            extensions: [".js", "json", ".scss"],
            alias:{
                "@": path.resolve( __dirname, "src" )
            },
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: [path.resolve(__dirname)],
                    exclude: /(node_mdoules|bower_components)/,
                    use: [
                        {
                            loader: "babel-loader"
                        }
                    ]
                },
                {
                    test: /\.((c|sa|sc)ss)$/i,
                    include: [
                        path.resolve(__dirname, "src", "styles")
                    ],
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath:  (resourcePath, context) => {
                                    return "../";
                                },
                            },
                        },
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: isProd ? true : false,
                            }
                        },
                        // {
                        //     loader: "resolve-url-loader"
                        // },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: isProd ? true : false,
                                // outputStyle: "compressed"
                            }
                        }
                    ],  
                    
                },
                // {
                //     test: /\.(png|svg|jpe?g|gif)$/,
                //     include: [
                //         path.resolve(__dirname, "/")
                //     ],
                //     use: [
                //         {
                //             loader: 'file-loader',
                //             options: {
                //                 name: '[name].[ext]',
                //                 outputPath: '',
                //                 esModule: false,
                //                 // publicPath: 'storefront/images/'
                //             }
                //         }
                //     ]
                // },
                { 
                    test: /\.handlebars$/, 
                    exclude: /(node_modules|bower_components)/,
                    include: [
                        path.resolve(__dirname, "src", "views")
                    ],
                    use: [
                        {
                            loader: "handlebars-loader",
                            options: {
                                helperDirs: path.join(__dirname, '/'),
                                precompileOptions: {
                                  knownHelpersOnly: false,
                                },
                            },
                        }
                    ]
                }
            ],
        }
    }
};