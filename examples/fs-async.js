#!/usr/bin/env node
"use strict";
const fs = require("fs");
const S2A = require("../");

(async function () {
    const readStream = fs.createReadStream(__filename);
    for await (const chunk of new S2A(readStream)) {
        console.log(chunk);
    }
})();
