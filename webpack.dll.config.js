const path = require('path');
const webpack = require('webpack');
let env = process.env.NODE_ENV;
module.exports = {
    mode:env,
    entry:  {
        vendor: ['react', 'react-dom']
    },
    output: {
        path: path.resolve(__dirname,'dist'),
        filename: 'dll_[name].js',
        library: "dll_[name]_[hash]"
    },
    plugins: [
        //生成动态链接库的对应关系
        new webpack.DllPlugin({
            path: path.resolve(__dirname,'dist','[name]-manifest.json'),
            name: "dll_[name]_[hash]"
        })
    ]
}