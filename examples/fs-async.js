#!/usr/bin/env node
"use strict";
const { Readable } = require("stream");
const S2A = require("../").default;

(async function () {
    const readStream = Readable.from([1, 2, 3]);
    for await (const chunk of new S2A(readStream)) {
        console.dir({ chunk });
    }
})();
