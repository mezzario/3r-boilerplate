/// <reference path="../../../typings/tsd.d.ts" />

import * as React from "react"; React;
const DocumentTitle = require("react-document-title");
import AppConfig from "../../configs/AppConfig";
const Styles = require("./App.less");

interface AppContainerProps extends /*React.Props<Container>, */ReactRouter.RouteComponentProps<{}, {}> {
}

interface AppContainerState {
}

export default class AppContainer extends React.Component<AppContainerProps, AppContainerState> {
    render() {
        return <DocumentTitle title={AppConfig.title}>
            <div className={Styles.root}>{this.props.children}</div>
        </DocumentTitle>
    }
}
