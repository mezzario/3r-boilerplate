import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"

export default class HelmetRoot extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  render() {
    return <Helmet titleTemplate="Todos · %s" defaultTitle="Todos">
      <html lang="en" />

      <meta charSet="utf-8" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="description" content="modern, universal and simple web application boilerplate built using cutting-edge technologies" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      <meta name="theme-color" content="#ffffff" />

      <link rel="apple-touch-icon" sizes="180x180" href="/content/favicons/apple-touch-icon.png?v=20170915" />
      <link rel="icon" type="image/png" sizes="32x32" href="/content/favicons/favicon-32x32.png?v=20170915" />
      <link rel="icon" type="image/png" sizes="16x16" href="/content/favicons/favicon-16x16.png?v=20170915" />
      <link rel="manifest" href="/manifest.json" />

      {this.props.children}
    </Helmet>
  }
}
