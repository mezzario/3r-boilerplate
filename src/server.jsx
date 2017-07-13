/* eslint-disable no-console */

process.setMaxListeners(0)

import * as Path from "path"
import * as FileSystem from "fs"
import React from "react"
const ReactDOMServer = require("react-dom/server")
import * as ReactRedux from "react-redux"
const Express = require("express")
const Compression = require("compression")
const ServeFavicon = require("serve-favicon")
const Cheerio = require("cheerio")
const Chalk = require("chalk")
const DocumentTitle = require("react-document-title")

import History from "./core/History"
import Routes, {StaticRouter} from "./core/Routes"
import Store from "./core/Store"
import AppConfig from "./configs/AppConfig"
import "./content/index.less"

const _store = Store(
  { // initial test data
    todos: [
      {id: 1, text: "Watch movie from favorites", completed: false},
      {id: 2, text: "Call Alice tomorrow afternoon", completed: true},
      {id: 3, text: "Buy gifts for colleagues", completed: false},
      {id: 4, text: "Apply for a new job", completed: false}
    ],
  }
)

const _appPort = __DEVELOPMENT__ ? AppConfig.server.devPort : AppConfig.server.prodPort
const _app = Express()

_app.use(Compression())

if (__DEVELOPMENT__) {
  const webpack = require("webpack")
  const webpackConfigFn = require("../webpack.config.js")
  const webpackConfig = webpackConfigFn({target: "client", build: "development"})
  const webpackCompiler = webpack(webpackConfig)

  _app.use(require("webpack-dev-middleware")(webpackCompiler, {
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    stats: {colors: true},
  }))

  _app.use(require("webpack-hot-middleware")(webpackCompiler))

  // main server part should be executed side by side with html and static resources
  process.chdir("src")
}

_app.use(ServeFavicon(Path.resolve("favicon.ico")))

if (!AppConfig.universal)
  _app.use(Express.static(Path.resolve(".")))
else {
  _app.use("/content", Express.static(Path.resolve("content")))

  _app.use((req, res) => {
    History._init("", req.url)

    let contentHtml = ReactDOMServer.renderToString(
      <ReactRedux.Provider store={_store}>
        <StaticRouter history={History}>
          <Routes />
        </StaticRouter>
      </ReactRedux.Provider>
    )

    if (History.context.url != null) {
      res.redirect(302, History.context.url)
    } else {
      let html = FileSystem.readFileSync("index.html", "utf8")
      let $ = Cheerio.load(html)
      let initialState = {..._store.getState()}

      delete initialState.routing

      $("title").text(DocumentTitle.rewind())
      $("head").append(`<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}</script>`)
      $("#root").empty().append(contentHtml)
      html = $.html()

      res
        .status(History.context.pageNotFound ? 404 : 200)
        .send(html)
    }
  })
}

_app.listen(_appPort, "localhost", err => {
  err ? console.error(Chalk.red(err))
    : console.info(Chalk.dim(`\nlistening at http://localhost:${_appPort}\n`))
})
