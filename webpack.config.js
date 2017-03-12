/* eslint-disable no-console */

const FileSystem = require("fs")
const Path = require("path")
const Webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const Chalk = require("chalk")
const Cheerio = require("cheerio")
const AppConfig = require("./src/configs/AppConfig")

module.exports = function(env) {
    console.info(Chalk.dim(`\nWebpack config requested for ${env.target}/${env.build}.\n`))

    const inlineFileSizeLimit = 16384
    const buildServerDir = "~build-server"
    const buildClientDir = "~build-client"

    function choose(...entries) {
        const def = "*"

        for (let i = 0; i < entries.length; i++) {
            const key = Object.keys(entries[i])[0]
            const parts = (key === def ? `${def}:${def}` : key).split(":")
            const p1 = parts[0] === def ? env.target : parts[0]
            const p2 = parts[1] === def ? env.build : parts[1]

            if (p1 === env.target && p2 === env.build)
                return entries[i][key]
        }
    }

    const cssLoaders = [
        "style-loader",
        {
            loader: "css-loader",
            options: {
                localIdentName: choose(
                    { "*:production": "[hash:base64:12]" },
                    { "*":            "[name]_[local]_[hash:base64:6]" }
                )
            }
        },
        "postcss-loader"
    ]

    const commonPlugins = [
        new Webpack.DefinePlugin({
            "process.env.NODE_ENV": `"${env.build}"`,
            __CLIENT__:      env.target === "client",
            __SERVER__:      env.target === "server",
            __DEVELOPMENT__: env.build  === "development",
            __PRODUCTION__:  env.build  === "production"
        }),
        new Webpack.LoaderOptionsPlugin({
            debug: choose(
                { "*:production": false },
                { "*":            true }
            )
        })
    ]

    return {
        target: choose(
            { "client:*": "web" },
            { "server:*": "node" }
        ),

        devtool: "source-map",

        entry: choose(
            { "client:development": ["webpack-hot-middleware/client", Path.resolve("src/client")] },
            { "client:production":  [Path.resolve("src/client")] },
            { "server:*":           [Path.resolve("src/server.jsx")] }
        ),

        output: choose(
            { "client:development": {
                path: Path.resolve("."),
                filename: "bundle.js",
                pathinfo: true,
                publicPath: "/content/"
            } },
            { "client:production": {
                path: Path.resolve("src", buildClientDir, "content"),
                filename: "[name].[hash].js",
                chunkFilename: "[name].[id].[chunkhash].js",
                publicPath: "/content/"
            } },
            { "server:*": {
                path: Path.resolve("src", buildServerDir),
                pathinfo: true,
                filename: "server.js",
                publicPath: "/content/"
            } }
        ),

        externals: choose(
            { "server:*": (() => {
                let nodeModules = {}
                FileSystem.readdirSync("node_modules")
                    .filter(s => [".bin", ".ds_store"].indexOf(s.toLowerCase()) < 0)
                    .forEach(s => nodeModules[s] = "commonjs " + s)
                return nodeModules
            })() },

            { "*": [] }
        ),

        module: {
            rules: [
                {
                    test: /\.jsx?$/i,
                    loader: "babel-loader",
                    exclude: /node_modules/,
                    include: Path.resolve("."),
                    options: {
                        presets: [
                            "es2015",
                            "stage-0",
                            "react"
                        ],
                        compact: false,
                        plugins: choose(
                            { "client:development": [
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
                            ] },
                            { "*": [] }
                        )
                    }
                }, {
                    test: /\.css$/i,
                    use: choose(
                        { "client:development": cssLoaders },
                        { "client:production":  ExtractTextPlugin.extract({ fallback: cssLoaders[0], use: cssLoaders.slice(1) }) },
                        { "server:*":           ExtractTextPlugin.extract({ fallback: cssLoaders[0], use: cssLoaders.slice(1) }) }
                    )
                }, {
                    test: /\.less$/i,
                    use: choose(
                        { "client:development": cssLoaders.concat("less-loader") },
                        { "client:production":  ExtractTextPlugin.extract({ fallback: cssLoaders[0], use: cssLoaders.slice(1).concat("less-loader") }) },
                        { "server:*":           ExtractTextPlugin.extract({ fallback: cssLoaders[0], use: cssLoaders.slice(1).concat("less-loader") }) }
                    )
                }, {
                    test: /\.(jpe?g|png|gif)$/i,
                    use: [
                        {
                            loader: "url-loader",
                            query: {
                                limit: inlineFileSizeLimit,
                                hash: "sha512",
                                digest: "hex",
                                name: "[hash].[ext]"
                            }
                        },
                        {
                            loader: "image-webpack-loader",
                            query: {
                                bypassOnDebug: true,
                                mozjpeg: {
                                    progressive: true,
                                    quality: 70
                                },
                                gifsicle: {
                                    interlaced: false
                                },
                                optipng: {
                                    optimizationLevel: 7
                                },
                                pngquant: {
                                    quality: "75-90",
                                    speed: 3
                                }
                            }
                        }
                    ]
                },

                { test: /\.eot$/i,   loader: "url-loader", query: { limit: inlineFileSizeLimit, mimetype: "application/vnd.ms-fontobject" } },
                { test: /\.ttf$/i,   loader: "url-loader", query: { limit: inlineFileSizeLimit, mimetype: "application/octet-stream" } },
                { test: /\.woff$/i,  loader: "url-loader", query: { limit: inlineFileSizeLimit, mimetype: "application/font-woff" } },
                { test: /\.woff2$/i, loader: "url-loader", query: { limit: inlineFileSizeLimit, mimetype: "application/font-woff2" } },
                { test: /\.svg$/i,   loader: "url-loader", query: { limit: inlineFileSizeLimit, mimetype: "image/svg+xml" } },

                { test: /\.modernizrrc$/i, use: ["modernizr-loader", "json-loader"] }
            ]
        },

        resolve: {
            extensions: [".js", ".jsx", ".json"],
            alias: {
                "modernizr$": Path.resolve(".modernizrrc")
            }
        },

        plugins: choose(
            { "client:development": [
                ...commonPlugins,
                new Webpack.HotModuleReplacementPlugin(),
                new Webpack.NoEmitOnErrorsPlugin()
            ] },
            { "client:production": [
                ...commonPlugins,
                new Webpack.optimize.UglifyJsPlugin(),
                new ExtractTextPlugin({ filename: "[name].[contenthash].css", allChunks: true }),
                function() {
                    // replace bundle.css and bundle.js in html with minified versions
                    // and copy html to build/dist folder:

                    this.plugin("done", statsData => {
                        let stats = statsData.toJson()
                        //FileSystem.writeFileSync(Path.resolve("stats.json"), JSON.stringify(stats, null, "  "), "utf8")

                        if (!stats.errors.length) {
                            let htmlFileName = "index.html"
                            let html = FileSystem.readFileSync(Path.resolve("src", htmlFileName), "utf8")
                            let mainCssFileName = stats.assetsByChunkName["main"].find(s => !!s.match(/\.css$/i))
                            let mainJsFileName = stats.assetsByChunkName["main"].find(s => !!s.match(/\.js$/i))
                            let $ = Cheerio.load(html)

                            $("#css-bundle").attr("href", Path.join("/content", mainCssFileName))
                            $("#js-bundle").attr("src", Path.join("/content", mainJsFileName))

                            let htmlOutput = $.html()
                            FileSystem.writeFileSync(`src/${buildClientDir}/${htmlFileName}`, htmlOutput)

                            AppConfig.outputStaticFiles
                                .forEach(path => FileSystem.createReadStream(`src/${path}`)
                                    .pipe(FileSystem.createWriteStream(`src/${buildClientDir}/${path}`)))
                        }
                    })
                }
            ] },
            { "server:*": [
                ...commonPlugins,
                new Webpack.NormalModuleReplacementPlugin(/modernizr$/i, "node-noop"),
                new ExtractTextPlugin({ filename: "bundle.css", allChunks: true })
            ] }
        )
    }
}
