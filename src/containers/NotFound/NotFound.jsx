import * as React from "react"
import * as ReactRouter from "react-router"
const AppConfig = require("../../configs/AppConfig")
const DocumentTitle = require("react-document-title")
const Styles = require("./NotFound.less")

export default class NotFound extends React.Component {
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
