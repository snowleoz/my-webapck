const path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const Happypack = require('happypack');
const Cssnext = require('postcss-cssnext');
const nodeExternals = require('webpack-node-externals');
let env = process.env.NODE_ENV;
module.exports = {
    mode:env,
    //打包时排除第三方模块，如react
    //开发环境下保留第三方模块
    externals: env=="production" ? [nodeExternals()]:[],
    //优化项目，只有当mode为生产环境（production）执行
    optimization:{
        // 压缩
        minimizer:[
            //压缩js
            new UglifyjsWebpackPlugin({
                //缓存文件
                cache: true,
                //并发压缩
                parallel: true,
                sourceMap: true
            }),
            //压缩css
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    //生成map文件，源码映射
    devtool:env=='development'?'source-map':'',
    //开发环境的express配置
    devServer:{
        port:8181,
        progress:true,
        contentBase:'./dist',
        compress:true
    },
    //入口文件
    entry:{
        index:'./src/index.js',
    },
    //输出配置
    output:{
        filename:env=="production"?'[name].js':'[name].bundle.[hash:8].js',
        chunkFilename:env=="production"?'[name].js':'[name].bundle.[hash:8].js',
        path:path.resolve(__dirname,'dist'),
        libraryTarget: env=="production"?'commonjs2':'var',
        publicPath:'/'
    },
    //对指定文件的解析模块
    module:{
        rules:[
            //对引入的图片地址进行解析
            {
                test: /\.(jpg|png|gif)$/,
                use:[
                    {
                        loader:'url-loader',
                        options:{
                            limit:5*1024,
                            outputPath:'images/'
                        }
                    }
                ]
            },
            //对引入的图片文件进行解析
            {
                test: /\.(eot|svg|ttf|woff|woff2|otf)/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            limit: 5*1024,
                            name: 'font/'
                        }
                    }
                ]
            },
            //解析html文件里引入的图片
            {
                test:/\.html$/,
                use:[
                    {
                        loader:'html-withimg-loader'
                    }
                ]
            },
            //对js文件进行解析，例如将es6转换es5
            {
                test:/\.js$/,
                exclude:/node_modules/,
                use:'happypack/loader?id=js'
            },
            //对css解析，支持css文件的引入和提取
            {
                test:/\.css$/,
                exclude:/node_modules/,
                use:[
                    {
                        loader:'style-loader'
                    },
                    {
                        loader:'css-loader',
                        options:{
                            modules:true,
                            localIdentName:'[name]-[local]-[hash:base64:6]'
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: loader => [
                                Cssnext({
                                    features: {
                                        rem: false
                                    },
                                    browser: ['>1%', 'last 10 versions', 'not ie <= 8']
                                })
                            ]
                        }
                    },
                ]
            }
        ]
    },
    //插件
    plugins:[
        //定义环境变量（给外部js使用）
        new Webpack.DefinePlugin({
            ENV:JSON.stringify(env)
        }),
        //以现有html文件为模板，自动引入入口js文件，自动压缩
        env=="production" ? new Function():new HtmlWebpackPlugin({
            template:'./src/index.html',
            filename:'index.html',
            minify:{
                collapseWhitespace:env=='development'?false:true
            }
        }),
        //针对js多线程打包
        new Happypack({
            id:'js',
            use:[
                {
                    loader:'babel-loader',
                    options:{
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ],
                        plugins:[
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-syntax-dynamic-import'
                        ]
                    },
                }
            ]
        }),
        //构建前删除dist目录，保持纯净
        new CleanWebpackPlugin({
            // Write Logs to Console
            verbose: true,
        })
    ]
}