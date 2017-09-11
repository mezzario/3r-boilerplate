/* eslint-disable no-console */

const FileSystem = require("fs")
const Path = require("path")
const Webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin")
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
          {"*:production": "[hash:base64:12]"},
          {"*":            "[name]_[local]_[hash:base64:6]"}
        ),
      },
    },
    "postcss-loader",
  ]

  const commonPlugins = [
    new Webpack.DefinePlugin({
      "process.env.NODE_ENV": `"${env.build}"`,
      __CLIENT__:      env.target === "client",
      __SERVER__:      env.target === "server",
      __DEVELOPMENT__: env.build  === "development",
      __PRODUCTION__:  env.build  === "production",
    }),
    new Webpack.LoaderOptionsPlugin({
      debug: choose(
        {"*:production": false},
        {"*":            true}
      ),
    }),
  ]

  const commonsChunkConfig = {
    name: "vendor",
    filename: "vendor-bundle.js",
    minChunks: module => module.context && module.context.indexOf("node_modules") !== -1,
  }

  return {
    target: choose(
      {"client:*": "web"},
      {"server:*": "node"}
    ),

    devtool: choose(
      {"*:production": "source-map"},
      {"server:*":     "cheap-source-map"},
      {"*":            "eval"}
    ),

    entry: choose(
      {"client:development": [
        "webpack-hot-middleware/client?reload=true",
        "react-hot-loader/patch",
        Path.resolve("src/client.jsx"),
      ]},
      {"client:production":  [Path.resolve("src/client.jsx")]},
      {"server:*":           [Path.resolve("src/server.jsx")]}
    ),

    output: choose(
      {"client:development": {
        path: Path.resolve("."),
        filename: "main-bundle.js",
        pathinfo: true,
        publicPath: "/content/",
      }},
      {"client:production": {
        path: Path.resolve("src", buildClientDir, "content"),
        filename: "[name].[hash].js",
        chunkFilename: "[name].[id].[chunkhash].js",
        publicPath: "/content/",
      }},
      {"server:*": {
        path: Path.resolve("src", buildServerDir),
        pathinfo: true,
        filename: "server.js",
        publicPath: "/content/",
      }}
    ),

    externals: choose(
      {"server:*": (() => {
        let nodeModules = {}
        FileSystem.readdirSync("node_modules")
          .filter(s => [".bin", ".ds_store"].indexOf(s.toLowerCase()) < 0)
          .forEach(s => nodeModules[s] = "commonjs " + s)
        return nodeModules
      })()},

      {"*": []}
    ),

    module: {
      rules: [
        {
          test: /\.jsx?$/i,
          include: Path.resolve("src"),
          use: "babel-loader",
        }, {
          test: /\.css$/i,
          use: choose(
            {"client:development": cssLoaders},
            {"client:production":  ExtractTextPlugin.extract({fallback: cssLoaders[0], use: cssLoaders.slice(1)})},
            {"server:*":           ExtractTextPlugin.extract({fallback: cssLoaders[0], use: cssLoaders.slice(1)})}
          ),
        }, {
          test: /\.less$/i,
          use: choose(
            {"client:development": cssLoaders.concat("less-loader")},
            {"client:production":  ExtractTextPlugin.extract({fallback: cssLoaders[0], use: cssLoaders.slice(1).concat("less-loader")})},
            {"server:*":           ExtractTextPlugin.extract({fallback: cssLoaders[0], use: cssLoaders.slice(1).concat("less-loader")})}
          ),
        }, {
          test: /\.(jpe?g|png|gif)$/i,
          use: [
            {
              loader: "url-loader",
              query: {
                limit: inlineFileSizeLimit,
                hash: "sha512",
                digest: "hex",
                name: "[hash].[ext]",
              },
            },
            {
              loader: "image-webpack-loader",
              query: {
                bypassOnDebug: true,
                mozjpeg: {
                  progressive: true,
                  quality: 70,
                },
                gifsicle: {
                  interlaced: false,
                },
                optipng: {
                  optimizationLevel: 7,
                },
                pngquant: {
                  quality: "75-90",
                  speed: 3,
                },
              },
            },
          ],
        },

        {test: /\.eot$/i,   loader: "url-loader", query: {limit: inlineFileSizeLimit, mimetype: "application/vnd.ms-fontobject"}},
        {test: /\.ttf$/i,   loader: "url-loader", query: {limit: inlineFileSizeLimit, mimetype: "application/octet-stream"}},
        {test: /\.woff$/i,  loader: "url-loader", query: {limit: inlineFileSizeLimit, mimetype: "application/font-woff"}},
        {test: /\.woff2$/i, loader: "url-loader", query: {limit: inlineFileSizeLimit, mimetype: "application/font-woff2"}},
        {test: /\.svg$/i,   loader: "url-loader", query: {limit: inlineFileSizeLimit, mimetype: "image/svg+xml"}},

        {test: /\.modernizrrc$/i, use: ["modernizr-loader", "json-loader"]},
      ],
    },

    resolve: {
      extensions: [".js", ".jsx", ".json"],
      alias: {
        "modernizr$": Path.resolve(".modernizrrc"),
      },
    },

    plugins: choose(
      {"client:development": [
        ...commonPlugins,
        new Webpack.HotModuleReplacementPlugin(),
        new Webpack.NamedModulesPlugin(),
        new Webpack.NoEmitOnErrorsPlugin(),
        new Webpack.optimize.CommonsChunkPlugin(commonsChunkConfig),
      ]},
      {"client:production": [
        ...commonPlugins,
        new Webpack.optimize.CommonsChunkPlugin(Object.assign({}, commonsChunkConfig, {
          filename: "[name].[id].[hash].js",
        })),
        new Webpack.optimize.ModuleConcatenationPlugin(),
        new Webpack.optimize.UglifyJsPlugin(),
        new Webpack.optimize.OccurrenceOrderPlugin(),
        new ExtractTextPlugin({filename: "[name].[contenthash].css", allChunks: true}),
        new OptimizeCssAssetsPlugin(),
        function() {
          // replace content bundles in html with minified versions
          // and copy html to build/dist folder:

          this.plugin("done", statsData => {
            let stats = statsData.toJson()
            // uncomment if you need to save stats file and inspect it
            //FileSystem.writeFileSync(Path.resolve("stats.json"), JSON.stringify(stats, null, "  "), "utf8")

            if (!stats.errors.length) {
              let htmlFileName = "index.html"
              let html = FileSystem.readFileSync(Path.resolve("src", htmlFileName), "utf8")
              let $ = Cheerio.load(html)

              $("#css-bundle-main" ).attr("href", Path.join("/content", stats.assetsByChunkName["main"].find(s => !!s.match(/\.css$/i))))
              $("#js-bundle-vendor").attr("src",  Path.join("/content", stats.assetsByChunkName["main"].find(s => !!s.match(/\.js$/i))))
              $("#js-bundle-main"  ).attr("src",  Path.join("/content", stats.assetsByChunkName["vendor"]))

              let htmlOutput = $.html()
              FileSystem.writeFileSync(`src/${buildClientDir}/${htmlFileName}`, htmlOutput)

              AppConfig.outputStaticFiles
                .forEach(path => FileSystem.createReadStream(`src/${path}`)
                  .pipe(FileSystem.createWriteStream(`src/${buildClientDir}/${path}`)))
            }
          })
        },
      ]},
      {"server:*": [
        ...commonPlugins,
        new ExtractTextPlugin({filename: "main-bundle.css", allChunks: true}),
        new Webpack.NormalModuleReplacementPlugin(/modernizr$/i, "node-noop"),
      ]}
    ),
  }
}
