# 3r-boilerplate

Modern, universal and simple **web application boilerplate** built using cutting-edge technologies.

> **R**eact + **R**edux + **R**outer = 3**R**

![](https://raw.githubusercontent.com/mezzario/3r-boilerplate/assets/3r.gif)

### Modern

Best technologies mixed in the right proportions to focus on **what** you want to do, not **how**:

Component | Description
--------- | -----------
**[React](https://github.com/facebook/react)** | UI library brought so many new trends into web development.
**[Redux](https://github.com/reactjs/redux)** | Predictable state container, powerful and simple.
**[React&nbsp;Router](https://github.com/reactjs/react-router)** | Routing that keeps your UI in sync with the URL.
**[Webpack](https://github.com/webpack/webpack)** | Remarkable module bundler.
**[TypeScript](https://github.com/Microsoft/TypeScript)** | Typed superset of JavaScript. Led by outstanding [Anders Hejlsberg](https://en.wikipedia.org/wiki/Anders_Hejlsberg).
**[LESS](https://github.com/less/less.js)** | CSS pre-processor of choice. Replace with [Sass](https://github.com/sass/sass)/[Stylus](https://github.com/stylus/stylus)/[PostCSS](https://github.com/postcss/postcss), if needed.
**[Semantic UI](https://github.com/Semantic-Org/Semantic-UI)** | UI component framework based around useful principles from natural language.
**[Local CSS](https://github.com/webpack/css-loader#local-scope)** | Scope CSS to specific elements using auto-generated unique identifiers for class names.
**[Autoprefixer](https://github.com/postcss/autoprefixer)** | Auto-generate vendor prefixes for CSS rules.
**[HMR&nbsp;support](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html)** | Hot Module Replacement (HMR) exchanges, adds, or removes modules while an application is running without a page reload. In particular, enables [hot reloading React classes](https://github.com/gaearon/react-transform-hmr).
**[Express](https://github.com/expressjs/express)** | Fast, unopinionated, minimalist web framework for node.
**[Node.js](https://github.com/nodejs/node)** | JavaScript runtime. An ecosystem for most parts of the app.

### Universal

**Same code** runs on **server** ([Node.js](https://github.com/nodejs/node)) and on **client** (browser) and used to define application logic and render pages.

Main benefits of being [universal](https://medium.com/@mjackson/universal-javascript-4761051b7ae9) is availability to search engines, browsers without (or disabled) JavaScript and improved visual experience on first render.

* Switch universality using **single flag** in configuration (enabled by default).
* If enabled, [HTML5 Browser History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) is used to manage URL.
* If disabled, app will be served as a **static website** and fallback to [location.hash](http://www.w3schools.com/jsref/prop_loc_hash.asp) to manage URL.
* For development universal and static versions are served by the same server component. It reduces code complexity and efforts to test it.

### Simple

## Usage
