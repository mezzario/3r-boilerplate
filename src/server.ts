import * as Path from "path";
import * as FileSystem from "fs";
import * as React from "react"; React;
import * as ReactDOMServer from "react-dom/server";
import * as ReactRedux from "react-redux";
import * as ReactRouter from "react-router";
import * as ReduxRouter from "react-router-redux";
import Routes from "./core/Routes";
import * as AppStore from "./core/Store";
import AppHistory from "./core/History";
import * as WebpackConfigurator from "./configs/WebpackConfigurator";
const Express = require("express");
const Compression = require("compression");
const ServeFavicon = require("serve-favicon");
const Cheerio = require("cheerio") as CheerioAPI;
const Chalk = require("chalk");
import AppConfig from "./configs/AppConfig";

const appPort = __DEVELOPMENT__ ? AppConfig.server.devPort : AppConfig.server.prodPort;
const appStore = AppStore.configure();
const appHistory = (ReduxRouter as any).syncHistoryWithStore(AppHistory, appStore);
const app = Express();

app.use(Compression());

if (__DEVELOPMENT__) {
    const webpack = require("webpack");
    const webpackConfig = WebpackConfigurator.configure("client", "development");
    const webpackCompiler = webpack(webpackConfig);

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
        ReactRouter.match({ routes: Routes(appHistory), location: req.url },
            (error, redirectLocation, renderProps) => {
                if (error)
                    res.status(500).send(error.message);
                else if (redirectLocation)
                    res.redirect(302, redirectLocation.pathname + redirectLocation.search);
                else if (renderProps) {
                    let routerContext = React.createElement(ReactRouter.RouterContext, Object.assign({}, renderProps) as any);
                    let provider = React.createElement(ReactRedux.Provider, { store: appStore } as any, routerContext);
                    let html = FileSystem.readFileSync("index.html", "utf8");
                    let contentHtml = ReactDOMServer.renderToString(provider);

                    let $ = Cheerio.load(html);
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
