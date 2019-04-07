const path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const Happypack = require('happypack');
const Cssnext = require('postcss-cssnext');
const TinyPngWebpackPlugin = require('tinypng-webpack-plugin');
const PurifyCss = require('purifycss-webpack');
const Glob = require('glob-all');
let env = process.env.NODE_ENV;
let config = {
    port:'8181',
    tingpng_key:'TikTGmc9mJvMI4xHe2QpQb9lL2vRoqQP',
    modules:true,
}
module.exports = {
    // mode:'production',
    mode:env,
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
            new OptimizeCSSAssetsPlugin({}),
            //使用TinyPNG的api压缩图片
            config.tingpng_key ? new TinyPngWebpackPlugin({
                key: config.tingpng_key,
                ext: ['png', 'jpeg', 'jpg']
            }):new Function(),
            //如果启用了css modules就不是用css shaking
            config.modules ? new Function() : new PurifyCss({
                paths: Glob.sync([
                    path.resolve(__dirname, 'src/*.js'),
                    path.resolve(__dirname, 'src/*.html'),
                    path.resolve(__dirname, 'src/**/*.js'),
                    path.resolve(__dirname, './node_modules/antd/dist/*.js')
                ]),
                minimize: true
            }),
        ]
    },
    //解析
    resolve:{
        //别名
        alias:{

        }
    },
    //生成map文件，源码映射
    devtool:env=='development'?'source-map':'',
    //开发环境的express配置
    devServer:{
        port:config.port,
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
        filename:'[name].bundle.[hash:8].js',
        chunkFilename:'[name].bundle.[hash:8].js',
        path:path.resolve(__dirname,'dist'),
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
                    MiniCssExtractPlugin.loader,
                    {
                        loader:'css-loader',
                        options:config.modules?{
                            modules:true,
                            localIdentName:'[hash:base64:6]'
                        }:{}
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
        new HtmlWebpackPlugin({
            template:'./src/index.html',
            filename:'index.html',
            minify:{
                collapseWhitespace:env=='development'?false:true
            }
        }),
        //提取css文件
        new MiniCssExtractPlugin({
            filename:'css/index.[hash:8].css'
        }),
        //全局注入第三方模块，如果需要单独引入，使用expose-loader
        new Webpack.ProvidePlugin({
            /**
             * example:
             * $:'jquery'
             */
        }),
        //连接动态链接库，分离第三方模块
        new Webpack.DllReferencePlugin({
            manifest: require('./dist/vendor-manifest.json'),
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
            cleanOnceBeforeBuildPatterns:['**/*','!dll_vendor.js','!vendor-manifest.json']
        })
    ]
}