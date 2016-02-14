/// <reference path="../typings/tsd.d.ts" />

import "core-js";
import * as React from "react"; React;
import * as ReactDOM from "react-dom";
import * as ReactRedux from "react-redux";
import * as ReactRouter from "react-router";
import * as AppStore from "./core/Store";
import AppHistory from "./core/History";
import * as Containers from "./containers";
import * as FastClick from "fastclick";
import "./index.less";

ReactDOM.render(
    <ReactRedux.Provider store={AppStore.configure()}>
        <ReactRouter.Router history={AppHistory}>
            <ReactRouter.Route path="/" component={Containers.App}>
                <ReactRouter.IndexRoute component={Containers.Home} />
                <ReactRouter.Route path="active" component={Containers.Home} />
                <ReactRouter.Route path="completed" component={Containers.Home} />
                <ReactRouter.Route path="*" component={Containers.NotFound} />
            </ReactRouter.Route>
        </ReactRouter.Router>
    </ReactRedux.Provider>,
    document.getElementById("root")
);

if ("addEventListener" in document)
    document.addEventListener("DOMContentLoaded", () => {
        FastClick.attach(document.body);
    }, false);
