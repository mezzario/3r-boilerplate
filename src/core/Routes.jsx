import * as React from "react"
import { Router, Route, IndexRoute } from "react-router"
import * as Containers from "../containers"

export default history =>
    <Router history={history}>
        <Route path="/" component={Containers.App}>
            <Route component={Containers.ContentPage}>
                <IndexRoute component={Containers.Home} onEnter={fixIndexRoute} />
                <Route path="/active" component={Containers.Home} />
                <Route path="/completed" component={Containers.Home} />
            </Route>
            <Route path="*" component={Containers.NotFound} />
        </Route>
    </Router>

// remove empty hash from url
function fixIndexRoute() {
    if (__CLIENT__ && window.history.replaceState)
        setTimeout(() => {
            const re = /#\/*$/

            if (re.test(window.location.hash))
                window.history.replaceState(null, null, String(window.location).replace(re, ""))
        }, 100)
}
