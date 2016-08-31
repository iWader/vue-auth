module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        files: [
            './test/*.js'
        ],
        preprocessors: {
            './test/*.js': ['webpack']
        },
        webpack: {
            module: {
                devtool: 'inline-source-map',
                loaders: [
                    {
                        exclude: /node_modules/,
                        loader: 'babel-loader',
                        test: /\.js$/,
                        query: {
                            plugins: ['transform-runtime'],
                            presets: ['es2015']
                        }
                    }
                ]
            }
        },
        webpackMiddleware: {
            noInfo: true,
        },
        singleRun: true
    });
};