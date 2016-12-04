import * as ReactRouter from "react-router"
const AppConfig = require("../configs/AppConfig")

export default (
    __CLIENT__
        ? (AppConfig.universal
            ? ReactRouter.browserHistory
            : ReactRouter.hashHistory)
        : ReactRouter.createMemoryHistory()
)
