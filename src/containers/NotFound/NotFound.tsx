import * as React from "react"; React;
import * as ReactRouter from "react-router";
const DocumentTitle = require("react-document-title");
const Styles = require("./NotFound.less");

export default () =>
    <DocumentTitle title="Page Not Found">
        <div className={Styles.root}>
            <div className="body">
                <div className="h1">Page Not Found</div>
                <div className="p">Sorry, but the page you were trying to view does not exist.</div>
                <div className="links"><ReactRouter.Link to="/">&larr; Back to Home Page</ReactRouter.Link></div>
            </div>
        </div>
    </DocumentTitle>
