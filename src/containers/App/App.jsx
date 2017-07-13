import React from "react"
import PropTypes from "prop-types"
const ReactCSSTransitionGroup = require("react-addons-css-transition-group")
const DocumentTitle = require("react-document-title")
import AppConfig from "../../configs/AppConfig"
const Styles = require("./App.less")

export default class App extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  render() {
    const appNode =
      <div key="app" className={Styles.root}>
        {this.props.children}
      </div>

    return <DocumentTitle title={AppConfig.getTitle()}>
      {AppConfig.universal
        ? appNode
        : <ReactCSSTransitionGroup
          component="div"
          className={Styles.animWrapper}
          transitionName="appear-fadein"
          transitionAppear={true}
          transitionAppearTimeout={500}
          transitionEnterTimeout={0}
          transitionLeaveTimeout={0}
        >{appNode}</ReactCSSTransitionGroup>}
    </DocumentTitle>
  }
}
