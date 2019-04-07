# my-webapck
个人在前端开发中常用的webpack配置；

webpack版本4.29.6

webpack.dll.config.js为动态链接库打包配置；

webpack.module.config.js为打包npm模块时使用的配置（在package的json中并无配置该项的命令）；

# 区分生产和开发环境
通过读取process.env.NODE_ENV来判断当前的开发环境；

package.json中的script已经做好区分，包括windows 和 linux 下的环境变量设置；
```json
  "scripts": {
    "winbuild": "set NODE_ENV=production&&webpack",
    "winserver": "set NODE_ENV=development&&webpack-dev-server",
    "windev": "set NODE_ENV=development&&webpack",
    "windll":"set NODE_ENV=production&&webpack --config webpack.dll.config.js",
    "build": "NODE_ENV=production webpack",
    "server": "NODE_ENV=development webpack-dev-server",
    "dev": "NODE_ENV=development webpack",
    "dll":"NODE_ENV=production webpack --config webpack.dll.config.js"
  }
```
以win开头的命令，则是以windows的cmd环境为准的环境变量配置；

其中dll的命令，是打包动态链接库的，默认为生产环境，配置文件为webpack.dll.config.js，如参考使用，请视情况自己添加其它第三方库；

# 配置功能
1. js、css代码的压缩，已经css代码的tree shaking（在css modules模式下不支持）；
2. 使用TinyPng模块，对项目静态图片进行压缩（需要TinyPng的API KEY）；
3. 对图片、字体文件引入的解析，包括HTML中引入图片的解析；
4. Happypack对js文件进行多线程打包；
5. postcss自动前缀补全，默认不对rem进行转换
6. 使用动态链接库，分离第三方代码，提高打包速度；
7. 提取css文件；
8. 以现有html文件为模板，自动引入入口js文件，生产环境会进行压缩；
9. 其它详见代码；

# 配置模块
- uglifyjs-webpack-plugin
- optimize-css-assets-webpack-plugin
- purifycss-webpack
- tinypng-webpack-plugin
- postcss-cssnext
- mini-css-extract-plugin
- html-webpack-plugin
- mini-css-extract-plugi
- happypack
- clean-webpack-plugin
- css-loader
- postcss-loader
- file-loader
- url-loader
- babel-loader
- @babel/preset-env
- @babel/preset-react
- @babel/plugin-syntax-dynamic-import
- webpack.DllReferencePlugin
- webpack.ProvidePlugin
- webpack.DefinePlugin
 
