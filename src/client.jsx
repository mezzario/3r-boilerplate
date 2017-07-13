import "core-js"
import React from "react"
import ReactDOM from "react-dom"
import * as ReactRedux from "react-redux"
import Routes from "./core/Routes"
import * as ReduxRouter from "react-router-redux"
import Store from "./core/Store"
import History from "./core/History"
const FastClick = require("fastclick")
import "./content/index.less"
import "modernizr"
import * as ReactHotLoader from "react-hot-loader"

const _store = Store(window.__INITIAL_STATE__)

const render = () => {
  ReactDOM.render(
    <ReactRedux.Provider store={_store}>
      <ReduxRouter.ConnectedRouter history={History}>
        <ReactHotLoader.AppContainer>
          <Routes />
        </ReactHotLoader.AppContainer>
      </ReduxRouter.ConnectedRouter>
    </ReactRedux.Provider>,
    document.getElementById("root")
  )
}

render()

if (__DEVELOPMENT__) {
  // remove server css bundle to not interfere with styles applied by webpack's style-loader
  const cssBundleElem = document.getElementById("css-bundle")
  cssBundleElem.parentNode.removeChild(cssBundleElem)

  if (module.hot)
    module.hot.accept("./core/Routes", render)
}

// remove empty hash from url
History.listen(() => {
  if (window.history.replaceState)
    setTimeout(() => {
      const re = /#\/*$/
      const url = String(window.location)
      if (re.test(url))
        window.history.replaceState(null, null, url.replace(re, ""))
    }, 100)
})

if ("addEventListener" in document)
  document.addEventListener("DOMContentLoaded", () => {
    FastClick.attach(document.body)
  }, false)
