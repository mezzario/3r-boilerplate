import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"
import urlJoin from "../../modules/utils/urlJoin"
import AppConfig from "../../configs/AppConfig"

export default class HelmetRoot extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  render() {
    const {webRoot} = AppConfig
    const faviconsPath = urlJoin(webRoot, "content/favicons")

    return <Helmet titleTemplate="Todos · %s" defaultTitle="Todos">
      <html lang="en" />

      <meta charSet="utf-8" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="description" content="modern, universal and simple web application boilerplate built using cutting-edge technologies" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      <meta name="apple-mobile-web-app-capable" content="yes" />

      <link rel="apple-touch-icon" sizes="180x180" href={`${faviconsPath}/apple-touch-icon.png?v=eE53MaA825`} />
      <link rel="icon" type="image/png" sizes="32x32" href={`${faviconsPath}/favicon-32x32.png?v=eE53MaA825`} />
      <link rel="icon" type="image/png" sizes="16x16" href={`${faviconsPath}/favicon-16x16.png?v=eE53MaA825`} />
      <link rel="manifest" href={`${faviconsPath}/manifest.json?v=eE53MaA825`} />
      <link rel="mask-icon" href={`${faviconsPath}/safari-pinned-tab.svg?v=eE53MaA825`} color="#5bbad5" />
      <link rel="shortcut icon" href={`${faviconsPath}/favicon.ico?v=eE53MaA825`} />
      <meta name="msapplication-config" content={`${faviconsPath}/browserconfig.xml?v=eE53MaA825`} />
      <meta name="theme-color" content="#ffffff" />

      {this.props.children}
    </Helmet>
  }
}
