import * as ReactRouter from "react-router"
import { createHashHistory } from "history"
const AppConfig = require("../configs/AppConfig")

export default (
    __CLIENT__
        ? (AppConfig.universal
            ? ReactRouter.browserHistory
            : ReactRouter.useRouterHistory(createHashHistory)({ queryKey: false }))
        : ReactRouter.createMemoryHistory()
)
