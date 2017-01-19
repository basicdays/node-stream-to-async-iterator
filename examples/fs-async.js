#!/usr/bin/env node
'use strict';
require('core-js/es7/symbol');
const fs = require('fs');
const S2A = require('..');


(async function() {
    const readStream = fs.createReadStream(__filename);
    for await (const chunk of new S2A(readStream)) {
        console.log(chunk);
    }
})();
