"use strict";

const BuildUtils = require("./scripts/build-utils");

let appConfig = eval(BuildUtils.transpileTsFile("src/configs/AppConfig.ts"));
let webpackConfigure = eval(BuildUtils.transpileTsFile("webpack.configurator.ts"));
let config = webpackConfigure(appConfig);

module.exports = config;
