import * as FileSystem from "fs-extra"
import * as Path from "path"
const Webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const Chalk = require("chalk")
import AppConfig from "./src/configs/AppConfig"
import Helmet from "react-helmet"
import Html from "./src/components/Html/Html.jsx"
import HelmetRoot from "./src/components/HelmetRoot/HelmetRoot.jsx"
import React from "react"
const ReactDOMServer = require("react-dom/server")
import getWebpackAssets from "./src/modules/webpack-assets"
const templateStr = require("es6-template-strings")

const inlineFileSizeLimit = 16384
const rootDir = Path.resolve(".").replace(/\/+$/, "")
const buildServerDir = Path.join(rootDir, "src/build")
const buildClientDir = Path.join(buildServerDir, AppConfig.publicSubdir)

export default function configure(env) {
  console.info(Chalk.dim(`\nWebpack config requested for ${env.target}/${env.build}.\n`))

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

  function getCssRule(...extraLoaders) {
    const extractPlugin = ExtractTextPlugin.extract({
      fallback: cssLoaders[0],
      use: cssLoaders.slice(1).concat(extraLoaders),
    })

    return choose(
      {"client:development": cssLoaders.concat(extraLoaders)},
      {"server:development": AppConfig.universal ? extractPlugin : "ignore-loader"},
      {"*": extractPlugin}
    )
  }

  const commonPlugins = [
    new Webpack.DefinePlugin({
      "process.env.NODE_ENV": `"${env.build}"`,
      __CLIENT__:      env.target === "client",
      __SERVER__:      env.target === "server",
      __DEVELOPMENT__: env.build  === "development",
      __PRODUCTION__:  env.build  === "production",
    }),
    new Webpack.LoaderOptionsPlugin({
      debug: env.target === "development",
    }),
    new ExtractTextPlugin({
      filename: choose(
        {"server:development": Path.relative(buildServerDir, Path.join(buildClientDir, "content/main-bundle.css"))},
        {"server:production":  Path.relative(buildServerDir, Path.join(buildClientDir, "content/[name].[contenthash].css"))},
        {"*":                  "[name].[contenthash].css"}
      ),
      allChunks: true,
    }),
  ]

  const commonsChunkConfig = {
    name: "vendor",
    filename: "vendor-bundle.js",
    minChunks: module => module.context && module.context.indexOf("node_modules") !== -1,
  }

  const config = {
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
        Path.join(rootDir, "src/client.jsx"),
      ]},
      {"client:production": [Path.join(rootDir, "src/client.jsx")]},
      {"server:*":          [Path.join(rootDir, "src/server.jsx")]}
    ),

    output: choose(
      {"client:*": {
        path: Path.join(buildClientDir, "content"),
        filename: choose(
          {"*:development": "main-bundle.js"},
          {"*:production":  "[name].[hash].js"},
        ),
        chunkFilename: choose(
          {"*:development": undefined},
          {"*:production":  "[name].[id].[chunkhash].js"},
        ),
        pathinfo: env.build === "development",
        publicPath: Path.join(AppConfig.webRoot, "content/"),
      }},
      {"server:*": {
        path: buildServerDir,
        filename: "server.js",
        pathinfo: true,
      }}
    ),

    externals: choose(
      {"server:*": (() => {
        const nodeModules = {}
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
          include: Path.join(rootDir, "src"),
          loader: "babel-loader",
          options: (() => {
            const jsonStr = FileSystem.readFileSync(Path.join(rootDir, ".babelrc"), "utf8")
            const json = JSON.parse(jsonStr)

            // disable .babelrc
            json.babelrc = false

            // disable transformation of ES6 module syntax to another module type
            // (required by react-hot-loader)
            json.presets.filter(p => Array.isArray(p) && p[0] === "es2015")[0][1].modules = false

            // add react-hot-loader transformations
            const rhlPlugin = "react-hot-loader/babel"
            if (env.target === "client"
              && env.build === "development"
              && !(json.plugins || []).some(p => p === rhlPlugin))
            {
              json.plugins = (json.plugins || []).concat(rhlPlugin)
            }

            return json
          })(),
        }, {
          test: /\.css$/i,
          use: getCssRule(),
        }, {
          test: /\.less$/i,
          use: getCssRule("less-loader"),
        }, {
          test: /\.scss$/i,
          use: getCssRule("sass-loader"),
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
        "modernizr$": Path.join(rootDir, ".modernizrrc"),
      },
    },

    plugins: choose(
      {"client:development": [
        ...commonPlugins,
        new Webpack.HotModuleReplacementPlugin(),
        new Webpack.NamedModulesPlugin(),
        new Webpack.NoEmitOnErrorsPlugin(),
        new Webpack.optimize.CommonsChunkPlugin(commonsChunkConfig),
        staticFilesWriterPlugin,
        assetsJsonWriterPlugin,
      ]},
      {"client:production": [
        ...commonPlugins,
        new Webpack.optimize.CommonsChunkPlugin(Object.assign({}, commonsChunkConfig, {
          filename: "[name].[id].[hash].js",
        })),
        new Webpack.optimize.ModuleConcatenationPlugin(),
        new Webpack.optimize.UglifyJsPlugin(),
        new Webpack.optimize.OccurrenceOrderPlugin(),
        new OptimizeCssAssetsPlugin(),
        staticFilesWriterPlugin,
        assetsJsonWriterPlugin,
      ]},
      {"server:*": [
        ...commonPlugins,
        new Webpack.NormalModuleReplacementPlugin(/modernizr$/i, "node-noop"),
      ]}
    ),
  }

  return config
}

function staticFilesWriterPlugin() {
  const {staticFiles} = AppConfig

  Object.keys(staticFiles)
    .forEach(path => {
      const srcPath = Path.join(rootDir, "src", path)
      const dstPath = Path.join(buildClientDir, path)
      const params = staticFiles[path] ? staticFiles[path].call() : null

      FileSystem.ensureDirSync(Path.dirname(dstPath))

      if (params) {
        let text = FileSystem.readFileSync(srcPath, "utf8")
        text = templateStr(text, params)
        FileSystem.writeFileSync(dstPath, text, "utf8")
      }
      else
        FileSystem.createReadStream(srcPath)
          .pipe(FileSystem.createWriteStream(dstPath))
    })

  if (!AppConfig.universal) // generate "index.html"
    this.plugin("done", statsData => {
      const stats = statsData.toJson()
      // uncomment if you need to save stats file and inspect it
      //FileSystem.writeFileSync(Path.join(rootDir, "stats.json"), JSON.stringify(stats, null, "  "), "utf8")

      if (!stats.errors.length) {
        ReactDOMServer.renderToStaticMarkup(React.createElement(HelmetRoot)) // fill Helmet with data

        const assets = getWebpackAssets(stats)
        const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Html, {
          helmet: Helmet.renderStatic(),
          webpackAssets: assets,
        }))

        FileSystem.writeFileSync(Path.join(buildClientDir, "index.html"), html)
      }
    })
}

function assetsJsonWriterPlugin() {
  this.plugin("done", statsData => {
    const stats = statsData.toJson()
    if (!stats.errors.length) {
      const assets = getWebpackAssets(stats)
      FileSystem.writeFileSync(Path.join(buildServerDir, "assets.json"), JSON.stringify(assets, null, "  "), "utf8")
    }
  })
}
