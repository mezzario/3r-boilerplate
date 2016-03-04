"use strict";

const Path = require("path");
const FileSystem = require("fs");
const Webpack = require("webpack");
const BuildUtils = require("./build-utils");
const Chalk = require("chalk");

BuildUtils.transpileTsFile("src/server.ts", "src/server.js");

let appConfig = eval(BuildUtils.transpileTsFile("src/configs/AppConfig.ts"));
let webpackConfigure = eval(BuildUtils.transpileTsFile("webpack.configurator.ts"));
let webpackConfig = webpackConfigure(appConfig, "server");

Webpack(webpackConfig, (error, statsData) => {
    if (error)
        console.error(Chalk.red(`ERROR:\n${error}\n`));
    else {
        let stats = statsData.toJson();
        //FileSystem.writeFileSync(Path.join(Path.resolve("."), "stats.json"), JSON.stringify(stats, null, "  "), "utf8");

        if (stats.errors.length)
            stats.errors.forEach(s => console.error(Chalk.red(`ERROR:\n${s}\n`)));
        else {
            stats.warnings.forEach(s => console.log(Chalk.dim(s + "\n")));

            console.log(Chalk.green("\nServer has been built successfully.\n"));
        }
    }
});
