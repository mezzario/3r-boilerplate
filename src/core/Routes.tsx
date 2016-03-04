import * as React from "react"; React;
import * as ReactRouter from "react-router";
import * as Containers from "../containers";
import "../content/index.less";

export default (history: HistoryModule.History) => (
    <ReactRouter.Router history={history}>
        <ReactRouter.Route path="/" component={Containers.App}>
            <ReactRouter.IndexRoute component={Containers.Home} />
            <ReactRouter.Route path="active" component={Containers.Home} />
            <ReactRouter.Route path="completed" component={Containers.Home} />
            <ReactRouter.Route path="*" component={Containers.NotFound} />
        </ReactRouter.Route>
    </ReactRouter.Router>
);
