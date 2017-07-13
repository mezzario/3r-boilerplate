import AppConfig from "../configs/AppConfig"
import invariant from "invariant"
import {addLeadingSlash, createPath, parsePath} from "history/PathUtils"

export default (
  __CLIENT__
    ? (AppConfig.universal
      ? require("history/createBrowserHistory").default
      : require("history/createHashHistory").default)
    : createStaticHistory
)()

// Below is static history creator extracted from:
// https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/StaticRouter.js
// and
// https://gist.github.com/tomatau/9c6011dcb5b9f357368aac2b3a2b1430
// It is used to separate static history and StaticRouter to be used with "react-router-redux"
// during server rendering. Remove it when "react-router" is updated.

function createStaticHistory(basename, location, context) {
  const noop = () => {}

  const normalizeLocation = (object) => {
    const {pathname = "/", search = "", hash = ""} = object

    return {
      pathname,
      search: search === "?" ? "" : search,
      hash: hash === "#" ? "" : hash,
    }
  }

  const addBasename = (basename, location) => {
    if (!basename)
      return location

    return {
      ...location,
      pathname: addLeadingSlash(basename) + location.pathname,
    }
  }

  const stripBasename = (basename, location) => {
    if (!basename)
      return location

    const base = addLeadingSlash(basename)

    if (location.pathname.indexOf(base) !== 0)
      return location

    return {
      ...location,
      pathname: location.pathname.substr(base.length),
    }
  }

  const createLocation = (location) =>
    typeof location === "string" ? parsePath(location) : normalizeLocation(location)

  const createURL = (location) =>
    typeof location === "string" ? location : createPath(location)

  const staticHandler = (methodName) => () => {
    invariant(
      false,
      "You cannot %s with <StaticRouter>",
      methodName
    )
  }

  const createHref = (path) =>
    addLeadingSlash(basename + createURL(path))

  const handlePush = (location) => {
    history.context.action = "PUSH"
    history.context.location = addBasename(basename, createLocation(location))
    history.context.url = createURL(history.context.location)
  }

  const handleReplace = (location) => {
    history.context.action = "REPLACE"
    history.context.location = addBasename(basename, createLocation(location))
    history.context.url = createURL(history.context.location)
  }

  const history = {
    // put context on history for use in StaticRouter
    createHref,
    action: "POP",
    push: handlePush,
    replace: handleReplace,
    go: staticHandler("go"),
    goBack: staticHandler("goBack"),
    goForward: staticHandler("goForward"),
    listen: noop,
    block: noop,
  }

  history._init = (_basename = "", _location = "/", _context = {}) => {
    basename = _basename
    location = _location
    context = _context

    history.context = context
    history.location = stripBasename(basename, createLocation(location))
  }

  history._init(basename, location, context)
  return history
}
