import React from "react"
import PropTypes from "prop-types"

export default class Html extends React.Component {
  static propTypes = {
    helmet: PropTypes.object,
    state: PropTypes.object,
    markup: PropTypes.string,
    webpackAssets: PropTypes.object,
  }

  render() {
    const {state, helmet, markup, webpackAssets} = this.props

    return <html {...(helmet ? helmet.htmlAttributes.toComponent() : {})}>
      <head>
        {helmet && helmet.title.toComponent()}
        {helmet && helmet.meta.toComponent()}
        {webpackAssets && webpackAssets.css.map(url => <link key={url} href={url} rel="stylesheet" />)}
        {helmet && helmet.link.toComponent()}
        {state && <script dangerouslySetInnerHTML={{__html:
          `window.__INITIAL_STATE__ = ${JSON.stringify(state)}`.trim()}} />}
      </head>

      <body {...(helmet ? helmet.bodyAttributes.toComponent() : {})}>
        {markup
          ? <div id="root" dangerouslySetInnerHTML={{__html: markup}} />
          : <div id="root">
            <div className="loader" style={{
              height: 50, lineHeight: "50px", margin: "auto",
              position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
              fontSize: 24, fontFamily: "helvetica, arial",
              whiteSpace: "nowrap", fontWeight: 100,
              textAlign: "center", color: "#ccc",
            }}>
              <script dangerouslySetInnerHTML={{__html: `document.write("⏳")`.trim()}} />
              <noscript>no JavaScript 😞</noscript>
            </div>
          </div>
        }

        {webpackAssets && webpackAssets.js.map(url => <script key={url} src={url} />)}
      </body>
    </html>
  }
}
