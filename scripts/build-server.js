"use strict";

const Path = require("path");
const FileSystem = require("fs");
const Webpack = require("webpack");
const BuildUtils = require("./build-utils");
const Chalk = require("chalk");
const WebpackConfigurator = eval(BuildUtils.transpileTsFile("src/configs/WebpackConfigurator.ts"));

BuildUtils.transpileTsFile("src/server.tsx", "src/server.js");

let webpackConfig = WebpackConfigurator.configure("server");
var webpackCompiler = Webpack(webpackConfig);

//webpackCompiler.watch(undefined, (error, statsData) => {
webpackCompiler.run((error, statsData) => {
    if (error)
        console.error(Chalk.red(`ERROR:\n${error}\n`));
    else {
        let stats = statsData.toJson();
        //FileSystem.writeFileSync(Path.join(Path.resolve("."), "stats.json"), JSON.stringify(stats, null, "  "), "utf8");

        if (stats.errors.length)
            stats.errors.forEach(s => console.error(Chalk.red(`ERROR:\n${s}\n`)));
        else {
            stats.warnings.forEach(s => console.log(Chalk.dim(`WARNING:\n${s}\n`)));

            console.log(Chalk.green("\nServer has been built successfully.\n"));
        }
    }
});
