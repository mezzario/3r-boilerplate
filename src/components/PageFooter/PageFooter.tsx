/// <reference path="../../../typings/tsd.d.ts" />

import * as React from "react"; React;
var Styles = require("./PageFooter.less");

export default () =>
    <footer className={Styles.root}>
        <div className="holder">
            <div className="block credit">© Eugene Baranchuk &middot; {new Date().getFullYear()}</div>

            <div className="block">
                <iframe src="https://ghbtns.com/github-btn.html?user=mezzario&repo=3r-boilerplate&type=star&count=true"
                    frameBorder="0" scrolling="0" width="95px" height="20px"></iframe>
            </div>
        </div>
    </footer>
