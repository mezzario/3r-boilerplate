import * as Redux from "redux";
const ReduxRouter = require("react-router-redux");
const ReduxThunk = require("redux-thunk") as ReduxThunk.Thunk;
const ReduxPromise = require("redux-promise");
import { ReduxLoggerOptions } from "redux-logger";
import * as Reducers from "../reducers";
import AppHistory from "../core/History";
import { TodoItem, TodosView } from "./Todos";

export interface AppStore {
    todosView: TodosView;
    todos: TodoItem[];
}

export function configure() {
    let reducer = Redux.combineReducers(Object.assign({}, Reducers, { routing: ReduxRouter.routeReducer }));
    let reduxRouterMw = ReduxRouter.syncHistory(AppHistory); // sync dispatched route actions to the history
    let middlewares = [ReduxThunk, ReduxPromise, reduxRouterMw];

    if (process.env.NODE_ENV === "development") {
        const createLogger = require("redux-logger") as (options?: ReduxLoggerOptions) => Redux.Middleware;
        let logger = createLogger({ collapsed: true });
        middlewares.push(logger);
    }

    let enhancer = Redux.compose(
        Redux.applyMiddleware(...middlewares),
        // please install https://github.com/zalmoxisus/redux-devtools-extension
        // chrome extension to use redux dev tools (open Redux tab in Chrome Developer Tools)
        (window as any).devToolsExtension ? (window as any).devToolsExtension() : f => f);

    let store = enhancer(Redux.createStore)(reducer);

    // required for replaying actions from devtools to work
    reduxRouterMw.listenForReplays(store);

    return store;
}
