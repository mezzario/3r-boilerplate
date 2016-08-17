import * as Redux from "redux"
import * as ReduxRouter from "react-router-redux"
import ReduxThunk from "redux-thunk"
const ReduxPromise = require("redux-promise")
import * as Reducers from "../reducers"

function createReducer(reducers) {
    let reducer = Redux.combineReducers({ ...reducers, routing: ReduxRouter.routerReducer })
    return reducer
}

export function configure(initialState?) {
    let reducer = createReducer(Reducers)
    let middlewares = [ReduxThunk, ReduxPromise]

    if (__DEVELOPMENT__) {
        const createLogger = require("redux-logger")
        let logger = createLogger({ collapsed: true })
        middlewares.push(logger)
    }

    let enhancer = Redux.compose(
        Redux.applyMiddleware(...middlewares),
        // please install https://github.com/zalmoxisus/redux-devtools-extension
        // chrome extension to use redux dev tools (open Redux tab in Chrome Developer Tools)
        __CLIENT__ && __DEVELOPMENT__ && window.devToolsExtension
            ? window.devToolsExtension() : f => f)

    let store = enhancer(Redux.createStore)(reducer, initialState)

    if (__CLIENT__ && __DEVELOPMENT__ && module.hot)
        module.hot.accept("../reducers", () => {
            store.replaceReducer(createReducer(require("../reducers")))
        })

    return store
}
