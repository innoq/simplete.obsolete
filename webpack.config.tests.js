var webpack = require("webpack");
var config = require("./webpack.config");

config.entry = "./test/index.js",
config.output.filename = "tests.js";
delete config.output.libraryTarget;
delete config.output.library;
module.exports = config;
