import React from "react"
import PropTypes from "prop-types"
import * as ReactRouter from "react-router-dom"
import {PageHeader, PageFooter} from "../../components"
const Styles = require("./ContentPage.less")

class ContentPage extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  render() {
    return <div className={Styles.root}>
      <div className="content-wrapper">
        <PageHeader />
        {this.props.children}
      </div>

      <PageFooter />
    </div>
  }
}

export default ReactRouter.withRouter(ContentPage)
