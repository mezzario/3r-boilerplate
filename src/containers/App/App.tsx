/// <reference path="../../../typings/tsd.d.ts" />

import * as React from "react"; React;
const DocumentTitle = require("react-document-title");
const Styles = require("./App.less");

interface AppProps extends /*React.Props<App>, */ReactRouter.RouteComponentProps<{}, {}> {
}

interface AppState {
}

export default class App extends React.Component<AppProps, AppState> {
    render() {
        return <DocumentTitle title="Todo">
            <div className={Styles.root}>{this.props.children}</div>
        </DocumentTitle>
    }
}
