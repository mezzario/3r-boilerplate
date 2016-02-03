/// <reference path="../typings/tsd.d.ts" />

import "core-js";
import * as React from "react"; React;
import * as ReactDOM from "react-dom";
import * as ReactRedux from "react-redux";
import * as ReactRouter from "react-router";
import * as AppStore from "./core/Store";
import AppHistory from "./core/History";
import MainPage from "./containers/MainPage/MainPage";
import * as FastClick from "fastclick";
import "./index.less";

ReactDOM.render(
    <ReactRedux.Provider store={AppStore.configure()}>
        <ReactRouter.Router history={AppHistory}>
            <ReactRouter.Route path="/(:todosView)" component={MainPage} />
        </ReactRouter.Router>
    </ReactRedux.Provider>,
    document.getElementById("root")
);

if ("addEventListener" in document)
    document.addEventListener("DOMContentLoaded", () => {
        FastClick.attach(document.body);
    }, false);
