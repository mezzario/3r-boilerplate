import * as Redux from "redux";
import * as ReduxRouter from "react-router-redux";
const ReduxThunk = require("redux-thunk") as ReduxThunk.Thunk;
const ReduxPromise = require("redux-promise");
import { ReduxLoggerOptions } from "redux-logger";
import * as Reducers from "../reducers";
import { TodoItem, TodosView } from "./Todos";

export interface AppStore {
    todos: TodoItem[];
    routing: ReactRouter.RouterState;
}

function createReducer(reducers) {
    let reducer = Redux.combineReducers(Object.assign({}, reducers, {
        routing: (ReduxRouter as any).routerReducer
    }));

    return reducer;
}

export function configure() {
    let reducer = createReducer(Reducers);
    let middlewares = [ReduxThunk, ReduxPromise];

    if (__DEVELOPMENT__) {
        const createLogger = require("redux-logger") as (options?: ReduxLoggerOptions) => Redux.Middleware;
        let logger = createLogger({ collapsed: true });
        middlewares.push(logger);
    }

    let enhancer = Redux.compose(
        Redux.applyMiddleware(...middlewares),
        // please install https://github.com/zalmoxisus/redux-devtools-extension
        // chrome extension to use redux dev tools (open Redux tab in Chrome Developer Tools)
        typeof window !== "undefined" && (window as any).devToolsExtension ? (window as any).devToolsExtension() : f => f);

    let store = enhancer(Redux.createStore)(reducer);

    if (__CLIENT__ && __DEVELOPMENT__ && (module as any).hot)
        (module as any).hot.accept("../reducers", () => {
            store.replaceReducer(createReducer(require("../reducers")));
        });

    return store;
}
