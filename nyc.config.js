"use strict";
const nycConfigBabel = require("@istanbuljs/nyc-config-babel");

exports = module.exports = {
    ...nycConfigBabel,
    all: true,
    exclude: ["src/test/**", "**/*.test.{ts,tsx,js,mjs}"],
    include: ["src/**/*.{ts,tsx,js,mjs}"],
    reporter: ["lcov", "text-summary"],
    require: [require.resolve("./babel-register")],
};
