import * as React from "react"
const Styles = require("./PageFooter.less")

export default () =>

<footer className={Styles.root}>
    <div className="holder">
        <div className="block">
            <iframe src="https://ghbtns.com/github-btn.html?user=mezzario&repo=3r-boilerplate&type=star&count=true"
                frameBorder="0" scrolling="0" width="95px" height="20px"></iframe>
        </div>

        <div className="block credit"><a href="http://baranchuk.eu/" target="_blank">© <em>Eugene Baranchuk</em> &middot; {new Date().getFullYear()}</a></div>
    </div>
</footer>
