import * as React from "react"; React;
import * as ReactRouter from "react-router";
const Styles = require("./NotFound.less");

export default () => (
    <div className={Styles.root}>
        <h1>Not Found <em>:(</em></h1>
        <p>The link was either <b>outdated</b> or <b>mistyped</b>.</p>
        <p><ReactRouter.Link to="/">Home</ReactRouter.Link></p>
    </div>
);
