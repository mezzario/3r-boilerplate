var Path = require("path");
var Webpack = require("webpack");
var FileSystem = require("fs");

var _dev = process.env.NODE_ENV !== "production";
var _inlineFileSizeLimit = 0x4000;
var _buildPath = "build";

var _cssLoaders = [
    "style",
    "css?localIdentName=" + (_dev
        ? "[name]_[local]_[hash:base64:6]"
        : "[hash:base64:12]"),
    "postcss"
];

module.exports = {
    debug: _dev,
    devtool: _dev
        ? "eval" // dev
        : "source-map", // prod
    entry: (_dev
        ? [ // dev
            "webpack-hot-middleware/client"
        ] : []).concat([ // dev and prod
            "./src/index"
        ]),
    output: Object.assign({}, _dev
        ? { // dev
            path: __dirname,
            pathinfo: true
        }
        : { // prod
            path: Path.join(__dirname, _buildPath, "static"),
            filename: "[name].[chunkhash].js",
            chunkFilename: "[name].[id].[chunkhash].js"
        },
        { // dev and prod
            publicPath: "/static/"
        }
    ),
    module: {
        loaders: [
            { test: /\.[jt]sx?$/i,                loader: "babel!ts", include: Path.join(__dirname, "src") },
            { test: /\.(jpe?g|png|gif|svg)$/i,    loaders: [
                "url?limit=" + _inlineFileSizeLimit + "&hash=sha512&digest=hex&name=[hash].[ext]",
                "image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false"
            ] },
            { test: /\.css$/i,                    loaders: _cssLoaders },
            { test: /\.less$/i,                   loaders: _cssLoaders.concat("less") },
            { test: /\.eot(\?[a-z0-9\.#]+)?$/i,   loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/vnd.ms-fontobject" },
            { test: /\.ttf(\?[a-z0-9\.#]+)?$/i,   loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/octet-stream" },
            { test: /\.woff(\?[a-z0-9\.#]+)?$/i,  loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/font-woff" },
            { test: /\.woff2(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/font-woff2" },
            { test: /\.svg(\?[a-z0-9\.#]+)?$/i,   loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=image/svg+xml" },
            { test: /\.modernizrrc$/,             loader: "modernizr" }
        ]
    },
    plugins: (_dev ? [ // dev
        new Webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("development")
            }
        }),
        new Webpack.HotModuleReplacementPlugin(),
        new Webpack.NoErrorsPlugin()
    ] : [ // prod
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
        }),
        function() { // replace bundle.js in html with minified version and copy html to build/dist folder
            this.plugin("done", function(statsData) {
                var stats = statsData.toJson();

                if (!stats.errors.length) {
                    var htmlFileName = "index.html";
                    var html = FileSystem.readFileSync(Path.join(__dirname, htmlFileName), "utf8");

                    var htmlOutput = html.replace(
                        /<script\s+src=(["'])(.+?)bundle\.js\1/i,
                        "<script src=$1$2" + stats.assetsByChunkName.main[0] + "$1");

                    FileSystem.writeFileSync(
                        Path.join(__dirname, _buildPath, htmlFileName),
                        htmlOutput);
                }
            });
        }
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
