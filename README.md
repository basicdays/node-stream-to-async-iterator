# Stream To Async Iterator [![npm version](https://badge.fury.io/js/stream-to-async-iterator.svg)](https://www.npmjs.com/package/stream-to-async-iterator) ![build](https://github.com/basicdays/node-stream-to-async-iterator/actions/workflows/build.yml/badge.svg)

## Overview

`stream-to-async-iterator` provides a wrapper that implements `Symbol.asyncIterator`. This will allow streams to be
usable as async iterables that can be used in for-await-of loops.

Supports node.js 12 and up.

## Installation

With NPM:

```shell
npm install stream-to-async-iterator
```

With Yarn:

```shell
yarn add stream-to-async-iterator
```

The included examples use async/await syntax for for-of loops. This assumes you are in an environment that natively
supports this new syntax, or that you use a tool such as Babel. In addition, for async iterators to work properly,
the `Symbol.asyncIterator` symbol must be defined. Core-js can help with that.

## Usage

Import the StreamToAsyncIterator class and pass the stream to its constructor. The iterator instance can be directly
used in for-of contexts.

If the stream is in object mode, each iteration will produce the next object. See the
[node documentation](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_types_of_streams) for more
information.

```js
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
```

Outputs:

```
{ chunk: 1 }
{ chunk: 2 }
{ chunk: 3 }
```

## References

-   https://github.com/tc39/proposal-async-iteration
-   https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-async-generator-functions
