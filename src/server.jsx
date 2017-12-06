import React from "react"
const ReactDOMServer = require("react-dom/server")
const Express = require("express")
const Compression = require("compression")
const Chalk = require("chalk")
import * as ReactRedux from "react-redux"
import Routes, {StaticRouter} from "./core/Routes"
import History from "./core/History"
import Store from "./core/Store"
import AppConfig from "./configs/AppConfig"
import Helmet from "react-helmet"
import {Html, HelmetRoot} from "./components"
import * as FileSystem from "fs-extra"
import * as Path from "path"
import urlJoin from "./modules/utils/urlJoin"
import "./content/index.less"

const app = Express()
app.use(Compression())

// please start server only in its own dir
const publicDir = Path.join(Path.resolve("."), AppConfig.publicSubdir)
FileSystem.ensureDirSync(publicDir)

if (__DEVELOPMENT__) {
  process.chdir("../..") // project root

  const webpack = require("webpack")
  const webpackConfigModule = require("../webpack.config.babel.js")
  const webpackConfigure = webpackConfigModule.default
  const webpackConfig = webpackConfigure({target: "client", build: "development"})
  const webpackCompiler = webpack(webpackConfig)
  const webpackDevMw = require("webpack-dev-middleware")
  const webpackDevMwInstance = webpackDevMw(webpackCompiler, {
    publicPath: Path.join("/", webpackConfig.output.publicPath),
    hot: true,
    stats: {colors: true},
  })
  const webpackHotMw = require("webpack-hot-middleware")
  const webpackHotMwInstance = webpackHotMw(webpackCompiler)

  app.use(webpackDevMwInstance, webpackHotMwInstance)

  let serve = false
  webpackDevMwInstance.waitUntilValid(() => {
    if (!serve) {
      serve = true
      main()
    }
  })

  app.use((req, res, next) => {
    if (!serve)
      res.status(202).send("Please wait for Webpack to finish compilation...")
    else
      next()
  })
}
else
  main()

const appPort = __DEVELOPMENT__
  ? AppConfig.server.devPort
  : AppConfig.server.prodPort

app.listen(appPort, "localhost", err => err
  ? console.error(Chalk.red(err))
  : console.info(Chalk.dim(`\nlistening at http://localhost:${appPort}\n`)))

function main() {
  // main routine should be run inside website's dir
  process.chdir(publicDir)

  const staticMw = Express.static(".", {fallthrough: false})
  const prepareUrl = path => Path.normalize(path).toLowerCase().replace(/^\/+/, "")
  const staticFiles = Object.keys(AppConfig.staticFiles).map(prepareUrl)
  const contentPath = urlJoin(prepareUrl(AppConfig.webRoot), "content/")

  app.use((req, res, next) => {
    const url = prepareUrl(req.url)

    if (url.startsWith(contentPath) || staticFiles.includes(url))
      return staticMw(req, res, next)

    next()
  })

  let webpackAssetsJsonStr, webpackAssets

  app.use((req, res) => {
    History._init("", req.url)

    // non-universal app manage history using hash url
    if (!AppConfig.universal && req.url !== "/")
      History.replace("/")

    // handle "push" or "replace" of url
    if (History.context.url != null) {
      res.redirect(302, History.context.url)
      return
    }

    const store = Store({
      todos: [ // initial test data
        {id: 1, text: "Watch movie from favorites",    completed: false},
        {id: 2, text: "Call Alice tomorrow afternoon", completed: true},
        {id: 3, text: "Buy gifts for colleagues",      completed: false},
        {id: 4, text: "Apply for a new job",           completed: false},
      ],
      routing: {
        location: History.location,
      },
    })

    let markup

    if (AppConfig.universal) {
      markup = ReactDOMServer.renderToString(
        <ReactRedux.Provider store={store}>
          <StaticRouter history={History}>
            <Routes />
          </StaticRouter>
        </ReactRedux.Provider>
      )

      if (__DEVELOPMENT__)
        ReactDOMServer.renderToString( // prevent css flickering for dev env
          <Helmet>
            <link
              id="css-bundle-main"
              href={urlJoin(AppConfig.webRoot, "content/main-bundle.css")}
              rel="stylesheet"
            />
          </Helmet>
        )
    }
    else
      ReactDOMServer.renderToStaticMarkup(<HelmetRoot />)

    if (!webpackAssetsJsonStr) {
      webpackAssetsJsonStr = FileSystem.readFileSync(`../assets.json`, "utf8")
      webpackAssets = JSON.parse(webpackAssetsJsonStr)
    }

    const htmlElem = <Html
      helmet={Helmet.renderStatic()}
      state={store.getState()}
      markup={markup}
      webpackAssets={webpackAssets}
    />

    const html = AppConfig.universal
      ? ReactDOMServer.renderToString(htmlElem)
      : ReactDOMServer.renderToStaticMarkup(htmlElem)

    res.status(History.context.pageNotFound ? 404 : 200)
    res.send(html)
  })
}
