import * as React from "react"; React;
import { Router, Route, IndexRoute } from "react-router";
import * as Containers from "../containers";
import "../content/index.less";

export default (history: HistoryModule.History) =>
    <Router history={history}>
        <Route path="/" component={Containers.App}>
            <IndexRoute component={Containers.Home} />
            <Route path="active" component={Containers.Home} />
            <Route path="completed" component={Containers.Home} />
            <Route path="*" component={Containers.NotFound} />
        </Route>
    </Router>
