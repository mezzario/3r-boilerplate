var Path = require("path");
var Webpack = require("webpack");

var _dev = process.env.NODE_ENV !== "production";
var _inlineFileSizeLimit = 0x4000;

var _cssLoaders = [
    "style",
    "css?localIdentName=" + (_dev
        ? "[name]_[local]_[hash:base64:6]"
        : "[hash:base64:12]"),
    "postcss"
];

module.exports = {
    debug: _dev,
    devtool: _dev ? "eval" : "source-map",
    entry: (_dev ? [ // dev only
        "webpack-hot-middleware/client"
    ] : []).concat([ // dev and prod
        "./src/index"
    ]),
    output: {
        path: Path.join(__dirname, "build"),
        filename: "bundle.js",
        publicPath: "/static/",
        pathinfo: _dev
    },
    module: {
        loaders: [
            { test: /\.[jt]sx?$/i, loader: "babel!ts", include: Path.join(__dirname, "src") },
            { test: /\.(jpe?g|png|gif|svg)$/i, loaders: [
                "url?limit=" + _inlineFileSizeLimit + "&hash=sha512&digest=hex&name=[hash].[ext]",
                "image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false"
            ] },
            { test: /\.css$/i, loaders: _cssLoaders },
            { test: /\.less$/i, loaders: _cssLoaders.concat("less") },
            { test: /\.eot(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/vnd.ms-fontobject" },
            { test: /\.ttf(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/octet-stream" },
            { test: /\.woff(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/font-woff" },
            { test: /\.woff2(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/font-woff2" },
            { test: /\.svg(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=image/svg+xml" },
            { test: /\.modernizrrc$/, loader: "modernizr" }
        ],
        noParse: [
            /autoit\.js$/i
        ]
    },
    plugins: (_dev ? [ // dev only
        new Webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("development")
            }
        }),
        new Webpack.HotModuleReplacementPlugin(),
        new Webpack.NoErrorsPlugin()
    ] : [ // prod only
        new Webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new Webpack.optimize.OccurenceOrderPlugin(),
        new Webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        })
    ]).concat([ // dev and prod
    ]),
    postcss: function() { return [
        require("autoprefixer")({ browsers: ["> 2%"] })
    ]; },
    ts: {
        compiler: "ntypescript",
        compilerOptions: {
            noEmit: false
        }
    },
    resolve: {
        extensions: ["", ".json", ".js", ".jsx", ".ts", ".tsx"],
        alias: {
            modernizr$: Path.resolve(__dirname, ".modernizrrc")
        }
    }
};
