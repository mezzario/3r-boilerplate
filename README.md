# 3r-boilerplate

Modern, universal and simple **web application boilerplate** built using cutting-edge technologies.

> **R**eact + **R**edux + **R**outer = 3**R**

## Modern

Cutting-edge technologies mixed in best proportions to focus on **what** you want to do, not **how**:

* **[React](https://github.com/facebook/react)**: UI library, brought so many new trends into web development.
* **[Redux](https://github.com/reactjs/redux)**: predictable state container for JavaScript apps, powerful and simple.
* **[React Router](https://github.com/reactjs/react-router)**
* **[Webpack](https://github.com/webpack/webpack)**
* **[TypeScript](https://github.com/Microsoft/TypeScript)**
* **[Locally scoped CSS](https://github.com/webpack/css-loader#local-scope)**
* **[Semantic UI](https://github.com/Semantic-Org/Semantic-UI)**
* **[Hot Module Replacement](https://github.com/gaearon/react-transform-hmr)**
* **[Express](https://github.com/expressjs/express)**

## Universal

**Same code** runs on **server** ([Node.js](https://nodejs.org/)) and on **client** (browser).

Universal web application available to **search engines**, browsers **without JavaScript** (or if it is disabled) and have **improved visual experience** when first rendered.

* Make it universal by switching **single flag** in configuration (enabled by default). If disabled, application can be served as a **static website**.

* If universal, application will use **[HTML5 Browser History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)** to manage URL. If static, **fallback to [location.hash](http://www.w3schools.com/jsref/prop_loc_hash.asp)** is performed.

* **Same codebase** is used to serve universal and static versions. It **reduces code complexity** and efforts to test it.

## Simple
