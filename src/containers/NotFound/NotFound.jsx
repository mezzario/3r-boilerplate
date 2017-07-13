import React from "react"
import PropTypes from "prop-types"
import * as ReactRouter from "react-router-dom"
import AppConfig from "../../configs/AppConfig"
const DocumentTitle = require("react-document-title")
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
    return <DocumentTitle title={AppConfig.getTitle("404")}>
      <div className={Styles.root}>
        <div className="body">
          <div className="header">Page Not Found</div>
          <div className="p">Sorry, but the page you were trying to view does not exist.</div>
          <div className="links"><ReactRouter.Link to="/">&larr; Back to Home Page</ReactRouter.Link></div>
        </div>
      </div>
    </DocumentTitle>
  }
}
