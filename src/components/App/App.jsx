import React from "react"
import PropTypes from "prop-types"
const CssTransition = require("react-addons-css-transition-group")
import AppConfig from "../../configs/AppConfig"
import {HelmetRoot} from "../../components"
const Styles = require("./App.less")

export default class App extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  render() {
    return <CssTransition
      component="div"
      className={Styles.animWrapper}
      transitionName="appear-fadein"
      transitionAppear={!AppConfig.universal}
      transitionAppearTimeout={500}
      transitionEnterTimeout={0}
      transitionLeaveTimeout={0}
    >
      <div key="app" className={Styles.root}>
        <HelmetRoot />
        {this.props.children}
      </div>
    </CssTransition>
  }
}
