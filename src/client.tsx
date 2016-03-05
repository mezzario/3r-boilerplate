/// <reference path="../typings/tsd.d.ts" />

import "core-js";
import * as React from "react"; React;
import * as ReactDOM from "react-dom";
import * as ReactRedux from "react-redux";
import * as ReduxRouter from "react-router-redux";
import Routes from "./core/Routes";
import * as AppStore from "./core/Store";
import AppHistory from "./core/History";
import * as FastClick from "fastclick";

const appStore = AppStore.configure();
const appHistory = (ReduxRouter as any).syncHistoryWithStore(AppHistory, appStore);

ReactDOM.render(
    <ReactRedux.Provider store={appStore}>{Routes(appHistory)}</ReactRedux.Provider>,
    document.getElementById("root")
);

if (__DEVELOPMENT__) {
    // remove server css bundle to not interfere with styles applied by webpack's style-loader
    let cssBundleElem = document.getElementById("server-bundle-css");
    cssBundleElem.parentNode.removeChild(cssBundleElem);
}

if ("addEventListener" in document)
    document.addEventListener("DOMContentLoaded", () => {
        FastClick.attach(document.body);
    }, false);