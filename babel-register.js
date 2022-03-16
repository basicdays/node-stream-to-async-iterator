"use strict";
const register = require("@babel/register");

register({
    extensions: [".ts", ".tsx", ".js", "mjs"],
    only: ["./src"],
});
