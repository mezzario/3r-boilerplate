/* eslint-disable no-console */

"use strict"

const FileSystem = require("fs")
//const MemoryFileSystem = require("memory-fs")
const Path = require("path")
const Webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const Chalk = require("chalk")
const Cheerio = require("cheerio")
//const AppConfig = require("./AppConfig")

function getAppTarget() {
    return (process.env.APP_TARGET || "client").trim().toLowerCase()
}

function getNodeEnv() {
    return (process.env.NODE_ENV || "development").trim().toLowerCase()
}

const inlineFileSizeLimit = 16384
const buildServerDir = "~build-server"
const buildClientDir = "~build-client"

function configure(appTarget, nodeEnv) {
    appTarget = appTarget || getAppTarget()
    nodeEnv = nodeEnv || getNodeEnv()

    const cssLoaders = [
        "style",
        "css?localIdentName=" + choose({
            "*:production": "[hash:base64:12]",
            "*": "[name]_[local]_[hash:base64:6]"
        }),
        "postcss"
    ]

    const lessLoaders = cssLoaders.concat("less")

    const defs = {
        "process.env.NODE_ENV": `"${nodeEnv}"`,
        __CLIENT__: appTarget === "client",
        __SERVER__: appTarget === "server",
        __DEVELOPMENT__: nodeEnv === "development",
        __PRODUCTION__: nodeEnv === "production"
    }

    const babelOptions = {
        presets: [
            "es2015",
            "stage-0",
            "react"
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
    }

    let config = {
        debug: choose({
            "*:production": false,
            "*": true
        }),

        target: choose({
            "client:*": "web",
            "server:*": "node"
        }),

        devtool: "source-map",

        progress: true,

        entry: choose({
            "client:development": [
                "webpack-hot-middleware/client",
                Path.resolve("src/client")
            ],
            "client:production": [
                Path.resolve("src/client")
            ],
            "server:*": [
                Path.resolve("src/server.jsx")
            ]
        }),

        output: choose({
            "client:development": {
                path: Path.resolve("."),
                pathinfo: true,
                publicPath: "/content/"
            },
            "client:production": {
                path: Path.resolve("src", buildClientDir, "content"),
                filename: "[name].[hash].js",
                chunkFilename: "[name].[id].[chunkhash].js",
                publicPath: "/content/"
            },
            "server:*": {
                path: Path.resolve("src", buildServerDir),
                pathinfo: true,
                filename: "server.js",
                publicPath: "/content/"
            }
        }),

        externals: choose({
            "server:*": (() => {
                let nodeModules = {}
                FileSystem.readdirSync("node_modules")
                    .filter(s => [".bin", ".ds_store"].indexOf(s.toLowerCase()) < 0)
                    .forEach(s => nodeModules[s] = "commonjs " + s)
                return nodeModules
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
                    test: /\.(jpe?g|png|gif)$/i,
                    loaders: [
                        "url?limit=" + inlineFileSizeLimit + "&hash=sha512&digest=hex&name=[hash].[ext]",
                        "image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false"
                    ]
                },

                { test: /\.eot(\?[a-z0-9\.#=]+)?$/i,
                  loader: "url?limit=" + inlineFileSizeLimit + "&mimetype=application/vnd.ms-fontobject" },

                { test: /\.ttf(\?[a-z0-9\.#=]+)?$/i,
                  loader: "url?limit=" + inlineFileSizeLimit + "&mimetype=application/octet-stream" },

                { test: /\.woff(\?[a-z0-9\.#=]+)?$/i,
                  loader: "url?limit=" + inlineFileSizeLimit + "&mimetype=application/font-woff" },

                { test: /\.woff2(\?[a-z0-9\.#=]+)?$/i,
                  loader: "url?limit=" + inlineFileSizeLimit + "&mimetype=application/font-woff2" },

                { test: /\.svg(\?[a-z0-9\.#=]+)?$/i,
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
                        let stats = statsData.toJson()
                        //FileSystem.writeFileSync(Path.resolve("stats.json"), JSON.stringify(stats, null, "  "), "utf8")

                        if (!stats.errors.length) {
                            let htmlFileName = "index.html"
                            let html = FileSystem.readFileSync(Path.resolve("src", htmlFileName), "utf8")
                            let mainCssFileName = stats.assetsByChunkName.main.find(s => !!s.match(/\.css$/i))
                            let mainJsFileName = stats.assetsByChunkName.main.find(s => !!s.match(/\.js$/i))
                            let $ = Cheerio.load(html)

                            $("#css-bundle").attr("href", `/content/${mainCssFileName}`)
                            $("#js-bundle").attr("src", `/content/${mainJsFileName}`)

                            let htmlOutput = $.html()

                            FileSystem.writeFileSync(`src/${buildClientDir}/${htmlFileName}`, htmlOutput)
                            FileSystem.createReadStream("src/favicon.ico").pipe(FileSystem.createWriteStream(`src/${buildClientDir}/favicon.ico`))
                        }
                    })
                }
            ],
            "server:*": [
                new Webpack.DefinePlugin(defs),
                new Webpack.optimize.OccurenceOrderPlugin(true),
                new Webpack.NormalModuleReplacementPlugin(/modernizr$/i, "node-noop"),
                new ExtractTextPlugin("bundle.css", { allChunks: true })
            ]
        }),

        postcss: () => [
            require("autoprefixer")({ browsers: ["> 2%"] })
        ],

        resolve: {
            extensions: ["", ".json", ".js", ".jsx"],
            alias: {
                "modernizr$": Path.resolve(".modernizrrc")
            }
        }
    }

    function choose(map) {
        const defKey = "*"
        let keys = Object.keys(map).filter(key => key !== defKey)

        if (map.hasOwnProperty(defKey))
            keys.push(defKey)

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const parts = (key === defKey ? `${defKey}:${defKey}` : key).split(":")
            const p1 = parts[0] === defKey ? appTarget : parts[0]
            const p2 = parts[1] === defKey ? nodeEnv : parts[1]

            if (p1 === appTarget && p2 === nodeEnv)
                return map[key]
        }
    }

    console.info(Chalk.dim(`\nGenerated Webpack config for appTarget = "${appTarget}", nodeEnv = "${nodeEnv}"\n`))

    return config
}

// function serverCompileFile(filename, nodeEnv) {
//     nodeEnv = nodeEnv || getNodeEnv()
//
//     console.info(Chalk.dim(`\nCompiling '${filename}' on server for nodeEnv = "${nodeEnv}"...\n`))
//
//     let webpackConfig = configure("server", nodeEnv)
//     webpackConfig.entry = filename
//     webpackConfig.output = { path: "/", filename: "compiled" }
//
//     let compiler = Webpack(webpackConfig)
//     compiler.outputFileSystem = new MemoryFileSystem()
//
//     compiler.run((error, statsData) => {
//         if (error)
//             console.error(Chalk.red(`ERROR:\n${error}\n`))
//         else {
//             let stats = statsData.toJson()
//             //FileSystem.writeFileSync(Path.join(Path.resolve("."), "stats.json"), JSON.stringify(stats, null, "  "), "utf8")
//
//             if (stats.errors.length)
//                 stats.errors.forEach(s => console.error(Chalk.red(`ERROR:\n${s}\n`)))
//             else {
//                 stats.warnings.forEach(s => console.log(Chalk.dim(`WARNING:\n${s}\n`)))
//
//                 let filename = Path.join(webpackConfig.output.path, webpackConfig.output.filename)
//                 let text = compiler.outputFileSystem.readFileSync(filename, "utf8")
//                 let result = eval(text)
//
//                 console.log(result)
//             }
//         }
//     })
// }

// example:
// WebpackConfigurator.serverCompileFile(Path.resolve("src/containers/Home/Home.less"), "development")

module.exports = {
    getAppTarget: getAppTarget,
    getNodeEnv: getNodeEnv,
    configure: configure
}
