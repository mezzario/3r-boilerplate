# 3r-boilerplate

> **R**eact + **R**edux + **R**outer = 3**R**

Modern, universal and simple **web application boilerplate** built using cutting-edge technologies.

![](https://raw.githubusercontent.com/mezzario/3r-boilerplate/assets/3r.gif)

### Modern

Best technologies mixed in the right proportions to focus on **what** you want to do, not **how**:

Component | Description
:-------- | :----------
**[React](https://github.com/facebook/react)** | UI library brought so many new trends into web development.
**[Redux](https://github.com/reactjs/redux)**&nbsp;+&nbsp;**[DevTools](https://github.com/gaearon/redux-devtools)** | Predictable state container, powerful and simple. DevTools supported as [Chrome extension](https://github.com/zalmoxisus/redux-devtools-extension).
**[React&nbsp;Router](https://github.com/reactjs/react-router)** | Routing that keeps your UI in sync with the URL.
**[Webpack](https://github.com/webpack/webpack)** | Remarkable module bundler.
**[TypeScript](https://github.com/Microsoft/TypeScript)** | Typed superset of JavaScript. Led by outstanding [Anders Hejlsberg](https://en.wikipedia.org/wiki/Anders_Hejlsberg).
**[LESS](https://github.com/less/less.js)** | CSS pre-processor of choice. Replace with [Sass](https://github.com/sass/sass) / [Stylus](https://github.com/stylus/stylus) / [PostCSS](https://github.com/postcss/postcss), etc, if needed.
**[Semantic UI](https://github.com/Semantic-Org/Semantic-UI)** | UI component framework based around useful principles from natural language. Replace with [Bootstrap](https://github.com/twbs/bootstrap) / [Foundation](https://github.com/zurb/foundation-sites) / [Pure](https://github.com/yahoo/pure/), etc, if needed.
**[Local CSS](https://github.com/webpack/css-loader#local-scope)** | Scope CSS to specific elements using auto-generated unique identifiers for class names.
**[Autoprefixer](https://github.com/postcss/autoprefixer)** | Auto-generate vendor prefixes for CSS rules.
**[HMR&nbsp;support](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html)** | Hot Module Replacement (HMR) exchanges, adds, or removes modules while an application is running without a page reload. In particular, enables [hot reloading React classes](https://github.com/gaearon/react-transform-hmr).
**[Express](https://github.com/expressjs/express)** | Fast, unopinionated, minimalist web framework for node.
**[Node.js](https://github.com/nodejs/node)** | JavaScript runtime. An ecosystem for most parts of the app.

### Universal

**Same code** runs on **server** ([Node.js](https://github.com/nodejs/node)) and on **client** (browser) and used to define application logic and render pages.

Main benefits of being [universal](https://medium.com/@mjackson/universal-javascript-4761051b7ae9) is availability to search engines, browsers without (or disabled) JavaScript and improved visual experience on first render.

* Switch universality using single flag in [configuration](https://github.com/mezzario/3r-boilerplate/blob/master/src/configs/AppConfig.ts) (enabled by default).
* If enabled, [HTML5 Browser History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) is used to manage URL.
* If disabled, app will be served as a **static website** and fallback to [location.hash](http://www.w3schools.com/jsref/prop_loc_hash.asp) to manage URL.
* For development universal and static versions are served by the same server component. It reduces code complexity and efforts to test it.

### Simple

Boilerplate include minimum configuration and components to get you started quickly and add more stuff later, if needed.

* Four **build configurations** managed in single file [`WebpackConfigurator.ts`](https://github.com/mezzario/3r-boilerplate/blob/master/src/configs/WebpackConfigurator.ts)
    * `server:development`
    * `server:production`
    * `client:development`
    * `client:production`
<br/><br/>
* Two **entry points**
    * [`server.tsx`](https://github.com/mezzario/3r-boilerplate/blob/master/src/server.tsx)
    * [`client.tsx`](https://github.com/mezzario/3r-boilerplate/blob/master/src/client.tsx)
<br/><br/>
* **Core components**
    * [`Actions`](https://github.com/mezzario/3r-boilerplate/blob/master/src/core/Actions.ts): Redux action definitions.
    * [`History`](https://github.com/mezzario/3r-boilerplate/blob/master/src/core/History.ts): Exports current browser history manager.
    * [`Routes`](https://github.com/mezzario/3r-boilerplate/blob/master/src/core/Routes.tsx): Application routes definition.
    * [`Store`](https://github.com/mezzario/3r-boilerplate/blob/master/src/core/Store.ts): Redux store configurator.
<br/><br/>
* **Reducers**
<br/><br/>
* **UI containers**
    * [`App`](https://github.com/mezzario/3r-boilerplate/tree/master/src/containers/App/App.tsx): main application container. Hosts other containers.
    * [`Home`](https://github.com/mezzario/3r-boilerplate/tree/master/src/containers/Home/Home.tsx): "index" container for application.
    * [`NotFound`](https://github.com/mezzario/3r-boilerplate/blob/master/src/containers/NotFound/NotFound.tsx): container to show "Page Not Found" message to user.
    * [`ContentPage`](https://github.com/mezzario/3r-boilerplate/blob/master/src/containers/ContentPage/ContentPage.tsx): optional container to use inside other containers. Will render header and/or sticky footer. See example in [`Home`](https://github.com/mezzario/3r-boilerplate/tree/master/src/containers/Home/Home.tsx) container.
<br/><br/>
* **UI components**
    * [`PageHeader`](https://github.com/mezzario/3r-boilerplate/tree/master/src/components/PageHeader/PageHeader.tsx), [`PageFooter`](https://github.com/mezzario/3r-boilerplate/tree/master/src/components/PageFooter/PageFooter.tsx): app's common page header and sticky footer. Do not add directly. Instead, use [`ContentPage`](https://github.com/mezzario/3r-boilerplate/blob/master/src/containers/ContentPage/ContentPage.tsx) container as a host.

## Overview

Webpack is used as a bundler for both server and client entries.

### Server Bundle

Generating server bundle with Webpack handles `require` calls to modules, supported only through Webpack loaders (like CSS or images, for example), extracting and removing them from resulting module. In theory that also means you should rebuild server every time you make (server-related) changes. In practice you won't do it often: most of the changes are client-related and propagated using hot updates without page reload.

If page is reloaded, server response may differ from what's rendered on client and you'll get warning from React similar to this:

```
Warning: React attempted to reuse markup in a container but the checksum
    was invalid. This generally means that you are using server rendering
    and the markup generated on the server was not what the client was
    expecting. React injected new markup to compensate which works but you
    have lost many of the benefits of server rendering. Instead, figure out
    why the markup being generated is different on the client or server: ...
```

You can ignore this message as long as you know that markup differs because of outdated server.

### Client Bundle

For development client bundle is generated on-the-fly using Webpack's middleware for Express. It provides HMR support as well.

For production static bundle is generated and saved into `build` folder.

## Usage

### Quick start

```
npm i
npm start
```

Then browse to [localhost:3000](http://localhost:3000/)

### npm scripts

Build & Run | &nbsp;
:---------- | :-----
`npm start` | Synonym for `npm run dev`.
`npm run dev` | Build and run development version of server and client.
`npm run prod` | Build and run production version of server and client.
**Build** | &nbsp;
`npm run build:server-dev` | Build server development bundle.
`npm run build:server-prod` | Build server production bundle.
`npm run build:client-prod` | Build client production bundle.
`npm run build:prod` | Build server and client production bundles.
**Clean** | &nbsp;
`npm run clean` | Clean all auto-generated files.
`npm run clean:server-dev` | Clean server development auto-generated files.
`npm run clean:server-prod` | Clean server production auto-generated files.
`npm run clean:prod` | Clean client and server production auto-generated files.
