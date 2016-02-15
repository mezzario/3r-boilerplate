/// <reference path="../../../typings/tsd.d.ts" />

import * as React from "react"; React;
const classNames = require("classnames") as ClassNamesFn;
const Styles = require("./App.less");

interface AppProps extends /*React.Props<App>, */ReactRouter.RouteComponentProps<{}, {}> {
}

interface AppState {
}

export default class App extends React.Component<AppProps, AppState> {
    render() {
        return (
            <div className={classNames("ui stackable centered grid", Styles.root)}>
                <div className="column">{this.props.children}</div>
            </div>
        );
    }
}
