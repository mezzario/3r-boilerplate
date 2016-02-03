var Path = require("path");
var Express = require("express");
var Webpack = require("webpack");
var WebpackConfig = require("./webpack.config");

var _app = Express();
var _compiler = Webpack(WebpackConfig);
var _appPort = 3000;

_app.use(require("webpack-dev-middleware")(_compiler, { publicPath: WebpackConfig.output.publicPath }));
_app.use(require("webpack-hot-middleware")(_compiler));
_app.use(Express.static("."));

_app.listen(_appPort, "localhost", function(err) {
    if (err) {
        console.log(err);
        return;
    }

    console.log("Listening at http://localhost:" + _appPort);
});
