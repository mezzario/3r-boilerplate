import * as FileSystem from "fs";
import * as Path from "path";
import * as Webpack from "webpack";
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Chalk = require("chalk");
import * as AppConfigModule from "./AppConfig";

export const buildSubpath = "build";
export const staticSubpath = "static";
export const inlineFileSizeLimit = 0x4000;

export function configure(
    appTarget = (process.env.APP_TARGET as string || "client").trim().toLowerCase(),
    nodeEnv = (process.env.NODE_ENV as string || "development").trim().toLowerCase()
) {
    const cssLoaders = [
        "style",
        "css?localIdentName=" + choose({
            "*:production": "[hash:base64:12]",
            "*": "[name]_[local]_[hash:base64:6]"
        }),
        "postcss"
    ];

    const lessLoaders = cssLoaders.concat("less");

    const defs = {
        __CLIENT__: appTarget === "client",
        __SERVER__: appTarget === "server",
        __DEVELOPMENT__: nodeEnv === "development",
        __PRODUCTION__: nodeEnv === "production"
    };

    const babelOptions = {
        presets: [
            "es2015"
        ],
        compact: false,
        plugins: choose({
            "client:development": [
                ["react-transform", {
                    "transforms": [{
                        "transform": "react-transform-hmr",
                        "imports": ["react"],
                        "locals": ["module"]
                    }, {
                        "transform": "react-transform-catch-errors",
                        "imports": ["react", "redbox-react"]
                    }]
                }]
            ],
            "*": []
        })
    };

    let config = {
        debug: choose({
            "*:production": false,
            "*": true
        }),

        target: choose({
            "client:*": "web",
            "server:*": "node"
        }),

        devtool: choose({
            "client:production": "source-map",
            "*": "hidden-source-map"
        }),

        progress: true,

        entry: choose({
            "client:development": [
                "webpack-hot-middleware/client",
                Path.resolve("src/core/app")
            ],
            "client:production": [
                Path.resolve("src/core/app")
            ],
            "server:*": [
                Path.resolve("src/server.js")
            ]
        }),

        output: choose({
            "client:development": {
                path: Path.resolve("."),
                pathinfo: true,
                publicPath: "/" + staticSubpath + "/"
            },
            "client:production": {
                path: Path.resolve(".", buildSubpath, staticSubpath),
                filename: "[name].[hash].js",
                chunkFilename: "[name].[id].[chunkhash].js",
                publicPath: "/" + staticSubpath + "/"
            },
            "server:*": {
                path: choose({
                    "*:development": Path.resolve("src"),
                    "*:production": Path.resolve(buildSubpath)
                }),
                pathinfo: true,
                filename: "server.js",
                publicPath: "/" + staticSubpath + "/"
            }
        }),

        externals: choose({
            "server:*": (() => {
                let nodeModules = {};
                FileSystem.readdirSync("node_modules")
                    .filter(s => [".bin", ".ds_store"].indexOf(s.toLowerCase()) < 0)
                    .forEach(s => nodeModules[s] = "commonjs " + s);
                return nodeModules;
            })(),

            "*": []
        }),

        module: {
            loaders: [
                {
                    test: /\.jsx?$/i,
                    loaders: ["babel?" + JSON.stringify(babelOptions)],
                    exclude: /node_modules/,
                    include: Path.resolve(".")
                }, {
                    test: /\.tsx?$/i,
                    loaders: ["babel?" + JSON.stringify(babelOptions), "ts"],
                    exclude: /node_modules/,
                    include: Path.resolve(".")
                }, {
                    test: /\.json$/i,
                    loader: "json"
                }, {
                    test: /\.css$/i,
                    loader: choose({
                        "client:development": cssLoaders.join("!"),
                        "client:production": ExtractTextPlugin.extract(cssLoaders[0], cssLoaders.slice(1).join("!")),
                        "server:*": ExtractTextPlugin.extract(cssLoaders[0], cssLoaders.slice(1).join("!"))
                    })
                }, {
                    test: /\.less$/i,
                    loader: choose({
                        "client:development": lessLoaders.join("!"),
                        "client:production": ExtractTextPlugin.extract(lessLoaders[0], lessLoaders.slice(1).join("!")),
                        "server:*": ExtractTextPlugin.extract(lessLoaders[0], lessLoaders.slice(1).join("!"))
                    })
                }, {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    loaders: [
                        "url?limit=" + inlineFileSizeLimit + "&hash=sha512&digest=hex&name=[hash].[ext]",
                        "image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false"
                    ]
                },

                { test: /\.eot(\?[a-z0-9\.#]+)?$/i,
                  loader: "url?limit=" + inlineFileSizeLimit + "&mimetype=application/vnd.ms-fontobject" },

                { test: /\.ttf(\?[a-z0-9\.#]+)?$/i,
                  loader: "url?limit=" + inlineFileSizeLimit + "&mimetype=application/octet-stream" },

                { test: /\.woff(\?[a-z0-9\.#]+)?$/i,
                  loader: "url?limit=" + inlineFileSizeLimit + "&mimetype=application/font-woff" },

                { test: /\.woff2(\?[a-z0-9\.#]+)?$/i,
                  loader: "url?limit=" + inlineFileSizeLimit + "&mimetype=application/font-woff2" },

                { test: /\.svg(\?[a-z0-9\.#]+)?$/i,
                  loader: "url?limit=" + inlineFileSizeLimit + "&mimetype=image/svg+xml" },

                { test: /\.modernizrrc$/, loader: "modernizr" }
            ]
        },
        plugins: choose({
            "client:development": [
                new Webpack.DefinePlugin(defs),
                new Webpack.HotModuleReplacementPlugin(),
                new Webpack.NoErrorsPlugin()
            ],
            "client:production": [
                new Webpack.DefinePlugin(defs),
                new Webpack.optimize.OccurenceOrderPlugin(true),
                new Webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                }),
                new ExtractTextPlugin("[name].[contenthash].css", { allChunks: true }),
                function() {
                    // replace bundle.css and bundle.js in html with minified versions
                    // and copy html to build/dist folder:

                    this.plugin("done", statsData => {
                        let stats = statsData.toJson();
                        //FileSystem.writeFileSync(Path.resolve("stats.json"), JSON.stringify(stats, null, "  "), "utf8");

                        if (!stats.errors.length) {
                            let htmlFileName = "index.html";
                            let html = FileSystem.readFileSync(Path.resolve("src", htmlFileName), "utf8");
                            let mainJsFileName = stats.assetsByChunkName.main.find(s => !!s.match(/\.js$/i));
                            let mainCssFileName = stats.assetsByChunkName.main.find(s => !!s.match(/\.css$/i));

                            let htmlOutput = html
                                .replace(/<script\s+src=(["'])(.+?)bundle\.js\1/i, "<script src=$1$2" + mainJsFileName + "$1")
                                .replace(/<link\s+href=(["'])(.+?)bundle\.css\1/i, "<link href=$1$2" + mainCssFileName + "$1");

                            FileSystem.writeFileSync(
                                Path.resolve(".", buildSubpath, htmlFileName),
                                htmlOutput);
                        }
                    });
                }
            ],
            "server:*": [
                new Webpack.DefinePlugin(defs),
                new Webpack.optimize.OccurenceOrderPlugin(true),
                new Webpack.NormalModuleReplacementPlugin(/modernizr$/i, "node-noop"),
                new ExtractTextPlugin(Path.join(staticSubpath, "bundle.css"), { allChunks: true })
            ]
        }),

        postcss: () => [
            require("autoprefixer")({ browsers: ["> 2%"] })
        ],

        ts: {
            compiler: "ntypescript",
            compilerOptions: {
                noEmit: false
            }
        },

        resolve: {
            extensions: ["", ".json", ".js", ".jsx", ".ts", ".tsx"],
            alias: {
                "modernizr$": Path.resolve(".modernizrrc")
            }
        }
    } as Webpack.Configuration;

    function choose(map) {
        const defKey = "*";
        let keys = Object.keys(map).filter(key => key !== defKey);

        if (map.hasOwnProperty(defKey))
            keys.push(defKey);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const parts = (key === defKey ? `${defKey}:${defKey}` : key).split(":");
            const p1 = parts[0] === defKey ? appTarget : parts[0];
            const p2 = parts[1] === defKey ? nodeEnv : parts[1];

            if (p1 === appTarget && p2 === nodeEnv)
                return map[key];
        }
    }

    console.info(Chalk.dim(`\nGenerated Webpack config for appTarget = "${appTarget}", nodeEnv = "${nodeEnv}".\n`));

    return config;
}
