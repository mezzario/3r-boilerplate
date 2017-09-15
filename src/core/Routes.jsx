import React from "react"
import PropTypes from "prop-types"
import {Router, Route, Switch} from "react-router-dom"
import * as Components from "../components"

export default () =>
  <Components.App>
    <Components.ContentPage>
      <Switch>
        <Route exact path='/' component={Components.Home} />
        <Route path="/active" component={Components.Home} />
        <Route path="/completed" component={Components.Home} />
        <Route path="*" component={Components.NotFound} />
      </Switch>
    </Components.ContentPage>
  </Components.App>

// StaticRouter extracted from:
// https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/StaticRouter.js
// and
// https://gist.github.com/tomatau/9c6011dcb5b9f357368aac2b3a2b1430
// It is used to separate static history and StaticRouter to be used with "react-router-redux"
// during server rendering. Remove it when "react-router" is updated.

export class StaticRouter extends React.Component {
  static propTypes = {
    history: PropTypes.object,
  };

  static childContextTypes = {
    router: PropTypes.object.isRequired,
  }

  getChildContext() {
    return {
      router: {
        staticContext: this.props.history.context,
      },
    }
  }

  render() {
    const {history, ...props} = this.props

    return <Router {...props} history={history} />
  }
}
