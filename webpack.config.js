var FileSystem = require("fs");
var Path = require("path");
var Webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var _inlineFileSizeLimit = 0x4000;
var _buildSubpath = "build";
var _staticSubpath = "static";

var choose = function(from, target) {
    target = target !== undefined ? target : (process.env.NODE_ENV || "development").toLowerCase();
    return from[target] !== undefined ? from[target] : from.$default;
};

var _cssLoaders = [
    "style",
    "css?localIdentName=" + choose({
        $default: "[name]_[local]_[hash:base64:6]",
        production: "[hash:base64:12]"
    }),
    "postcss"
];

var _lessLoaders = _cssLoaders.concat(["less"]);

module.exports = {
    debug: choose({
        $default: true,
        production: false
    }),

    devtool: choose({
        $default: "eval",
        production: "source-map"
    }),

    progress: true,

    entry: choose({
        $default: [
            "webpack-hot-middleware/client",
            "./src/index"
        ],
        production: [
            "./src/index"
        ]
    }),

    output: choose({
        $default: {
            path: __dirname,
            pathinfo: true,
            publicPath: "/" + _staticSubpath + "/"
        },
        production: {
            path: Path.join(__dirname, _buildSubpath, _staticSubpath),
            filename: "[name].[hash].js",
            chunkFilename: "[name].[id].[chunkhash].js",
            publicPath: "/" + _staticSubpath + "/"
        }
    }),

    module: {
        loaders: [
            { test: /\.[jt]sx?$/i,
              loader: "babel!ts",
              include: Path.join(__dirname, "src") },

            { test: /\.css$/i,
              loader: choose({
                  $default: _cssLoaders.join("!"),
                  production: ExtractTextPlugin.extract(_cssLoaders[0], _cssLoaders.slice(1).join("!")) }) },

            { test: /\.less$/i,
              loader: choose({
                  $default: _lessLoaders.join("!"),
                  production: ExtractTextPlugin.extract(_lessLoaders[0], _lessLoaders.slice(1).join("!")) }) },

            { test: /\.(jpe?g|png|gif|svg)$/i,
              loaders: [
                "url?limit=" + _inlineFileSizeLimit + "&hash=sha512&digest=hex&name=[hash].[ext]",
                "image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false"] },

            { test: /\.eot(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/vnd.ms-fontobject" },
            { test: /\.ttf(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/octet-stream" },
            { test: /\.woff(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/font-woff" },
            { test: /\.woff2(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=application/font-woff2" },
            { test: /\.svg(\?[a-z0-9\.#]+)?$/i, loader: "url?limit=" + _inlineFileSizeLimit + "&mimetype=image/svg+xml" },

            { test: /\.modernizrrc$/, loader: "modernizr" }
        ]
    },
    plugins: choose({
        development: [
            new Webpack.DefinePlugin({
                "process.env": {
                    "NODE_ENV": JSON.stringify("development")
                },
                __CLIENT__: true,
                __SERVER__: false,
                __DEVELOPMENT__: true
            }),
            new Webpack.HotModuleReplacementPlugin(),
            new Webpack.NoErrorsPlugin()
        ],
        production: [
            new Webpack.DefinePlugin({
                "process.env": {
                    "NODE_ENV": JSON.stringify("production")
                },
                __CLIENT__: true,
                __SERVER__: false,
                __DEVELOPMENT__: false
            }),
            new Webpack.optimize.OccurenceOrderPlugin(),
            new Webpack.optimize.UglifyJsPlugin({
                compressor: {
                    warnings: false
                }
            }),
            new ExtractTextPlugin("[name].[contenthash].css", { allChunks: true }),
            function() { // replace bundle.js in html with minified version and copy html to build/dist folder
                this.plugin("done", function(statsData) {
                    var stats = statsData.toJson();
                    //FileSystem.writeFileSync(Path.join(__dirname, "stats.json"), JSON.stringify(stats), "utf8");

                    if (!stats.errors.length) {
                        var htmlFileName = "index.html";
                        var html = FileSystem.readFileSync(Path.join(__dirname, htmlFileName), "utf8");
                        var mainJsFileName = stats.assetsByChunkName.main.find(s => !!s.match(/\.js$/i));
                        var mainCssFileName = stats.assetsByChunkName.main.find(s => !!s.match(/\.css$/i));

                        var htmlOutput = html
                            .replace(
                                /<script\s+src=(["'])(.+?)bundle\.js\1/i,
                                "<script src=$1$2" + mainJsFileName + "$1")
                            .replace(
                                /(<\/head>)/i,
                                "<link rel='stylesheet' href='" + _staticSubpath + "/" + mainCssFileName + "' />\n\n$1");

                        FileSystem.writeFileSync(
                            Path.join(__dirname, _buildSubpath, htmlFileName),
                            htmlOutput);
                    }
                });
            }
        ]
    }),

    postcss: function() {
        return [
            require("autoprefixer")({ browsers: ["> 2%"] })
        ];
    },

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
