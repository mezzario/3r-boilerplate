"use strict";

const BuildUtils = require("./scripts/build-utils");

let webpackConfigure = eval(BuildUtils.transpileTsFile("src/configs/WebpackConfigurator.ts"));
let config = webpackConfigure();

module.exports = config;
