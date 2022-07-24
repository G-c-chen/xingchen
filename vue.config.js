module.exports = {
    productionSourceMap: false,
    devServer: {
        overlay: {
            warnings: false,
            errors: false,
        },
    },
    css: {
        loaderOptions: {
            css: {
                // options here will be passed to css-loader
            },
            postcss: {
                // options here will be passed to postcss-loader
                plugins: [require('postcss-px2rem')({
                    remUnit: 75
                })]
            }
        }
    },
    lintOnSave: false,
};
