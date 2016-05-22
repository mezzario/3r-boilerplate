"use strict";

const BuildUtils = require("./scripts/build-utils");
const WebpackConfigurator = eval(BuildUtils.transpileTsFile("src/configs/WebpackConfigurator.ts"));

let config = WebpackConfigurator.configure();

module.exports = config;
