import * as Redux from "redux"
import * as ReduxRouter from "react-router-redux"
import ReduxThunk from "redux-thunk"
const ReduxPromise = require("redux-promise")
import * as Reducers from "../reducers"
import History from "./History"

const createReducer = () => Redux.combineReducers({
  ...Reducers,
  routing: ReduxRouter.routerReducer,
})

export default initialState => {
  const store = Redux.createStore(
    createReducer(),
    initialState,
    Redux.compose(...[
      Redux.applyMiddleware(...[
        ReduxRouter.routerMiddleware(History),
        ReduxThunk,
        ReduxPromise,
        ...(__DEVELOPMENT__ ? [require("redux-logger").createLogger({collapsed: true})] : [])
      ]),
      // please install https://github.com/zalmoxisus/redux-devtools-extension
      // chrome extension to use redux dev tools (open Redux tab in Chrome Developer Tools)
      ...(__CLIENT__ && __DEVELOPMENT__ && window.devToolsExtension ? [window.devToolsExtension()] : [])
    ])
  )

  if (__CLIENT__ && __DEVELOPMENT__ && module.hot)
    module.hot.accept("../reducers", () => store.replaceReducer(createReducer()))

  return store
}
