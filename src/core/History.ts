import * as ReactRouter from "react-router";
import AppConfig from "../configs/AppConfig";

export default (
    __CLIENT__
        ? (AppConfig.universal
            ? ReactRouter.browserHistory
            : (ReactRouter as any).useRouterHistory(require("history/lib/createHashHistory"))({ queryKey: false }))
        : (ReactRouter as any).createMemoryHistory()
) as HistoryModule.History;
