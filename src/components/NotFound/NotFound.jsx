import React from "react"
import PropTypes from "prop-types"
import * as ReactRouter from "react-router-dom"
import Helmet from "react-helmet"
const Styles = require("./NotFound.less")

export default class NotFound extends React.Component {
  static propTypes = {
    staticContext: PropTypes.shape({
      pageNotFound: PropTypes.bool,
    }),
  };

  constructor(props) {
    super(props)

    if (props.staticContext)
      props.staticContext.pageNotFound = true
  }

  render() {
    return <div className={Styles.root}>
      <Helmet>
        <title>404</title>
      </Helmet>

      <div className="body">
        <div className="header">Page not found</div>
        <div className="p">Sorry, but the page you were trying to view does not exist.</div>
        <div className="links"><ReactRouter.Link to="/">🏠</ReactRouter.Link></div>
      </div>
    </div>
  }
}
