import * as Path from "path";
import * as FileSystem from "fs";
import * as React from "react"; React;
import * as ReactDOMServer from "react-dom/server";
import * as ReactRedux from "react-redux";
import * as ReactRouter from "react-router";
const RouterContext = ReactRouter.RouterContext as any;
import * as ReduxRouter from "react-router-redux";
import * as ExpressModule from "express";
const Express = require("express") as typeof ExpressModule;
const Compression = require("compression");
const ServeFavicon = require("serve-favicon");
const Cheerio = require("cheerio") as CheerioAPI;
const Chalk = require("chalk");
const DocumentTitle = require("react-document-title");

import Routes from "./core/Routes";
import * as AppStore from "./core/Store";
import AppHistory from "./core/History";
import * as WebpackConfigurator from "./configs/WebpackConfigurator";
import AppConfig from "./configs/AppConfig";

const appStore = AppStore.configure(
    // { // initial test data
    //     todos: [
    //         { id: 1, text: "Watch movie from favorites", completed: false },
    //         { id: 2, text: "Call Alice tomorrow afternoon", completed: true },
    //         { id: 3, text: "Buy gifts for colleagues", completed: false },
    //         { id: 4, text: "Apply for a new job", completed: false }
    //     ]
    // }
);

const appHistory = (ReduxRouter as any).syncHistoryWithStore(AppHistory, appStore);
const appPort = __DEVELOPMENT__ ? AppConfig.server.devPort : AppConfig.server.prodPort;
const app = Express();

app.use(Compression());

if (__DEVELOPMENT__) {
    const Webpack = require("webpack");

    let webpackConfig = WebpackConfigurator.configure("client", "development");
    let webpackCompiler = Webpack(webpackConfig);

    app.use(require("webpack-dev-middleware")(webpackCompiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: { colors: true }
    }));

    app.use(require("webpack-hot-middleware")(webpackCompiler));

    // main server part should be executed side by side with html and static resources
    process.chdir("src");
}

app.use(ServeFavicon(Path.resolve("favicon.ico")));

if (!AppConfig.universal)
    app.use(Express.static(Path.resolve(".")));
else {
    app.use("/static", Express.static(Path.resolve("static")));

    app.use((req, res) => {
        ReactRouter.match({ routes: Routes(appHistory), location: req.url as any },
            (error, redirectLocation, renderProps) => {
                if (error)
                    res.status(500).send(error.message);
                else if (redirectLocation)
                    res.redirect(302, redirectLocation.pathname + redirectLocation.search);
                else if (renderProps) {
                    let contentHtml = ReactDOMServer.renderToString(
                        <ReactRedux.Provider store={appStore}>
                            <RouterContext {...renderProps} />
                        </ReactRedux.Provider>
                    );

                    let html = FileSystem.readFileSync("index.html", "utf8");
                    let $ = Cheerio.load(html);
                    $("title").text(DocumentTitle.rewind());
                    $("head").append(`<script>window.__INITIAL_STATE__ = ${JSON.stringify(appStore.getState())};</script>`)
                    $("#root").empty().append(contentHtml);
                    html = $.html();

                    res.status(200).send(html);
                }
                else
                    res.status(404).send("Not found.");
            });
    });
}

app.listen(appPort, "localhost", err => {
    err ? console.error(Chalk.red(err))
        : console.info(Chalk.dim(`\nlistening at http://localhost:${appPort}\n`));
});
