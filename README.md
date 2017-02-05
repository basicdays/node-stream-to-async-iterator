# Stream To Async Iterator


## Overview

`stream-to-async-iterator` provides a wrapper that implements `Symbol.asyncIterator`. This will allow streams to be usable
as async iterables that can be used in for-await-of loops.

Supports node.js 4 and up.

## Installation

```
$ npm install stream-to-async-iterator
```

The examples provides use async/await syntax for for-of loops. This assumes you are in an environment that natively
supports this new syntax, or that you use a tool such as Babel. In addition, for async iterators to work properly,
the `Symbol.asyncIterator` symbol must be defined. Core-js or `babel-polyfill` can both help with that.


## Usage

Import the StreamToAsyncIterator class and pass the stream to its constructor. The iterator instance can be directly
used in for-of contexts.

If the stream is in object mode, each iteration will produce the next object. See the
[node documentation](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_types_of_streams) for more
information.

```js
#!/usr/bin/env node
'use strict';
require('core-js/es7/symbol');
const fs = require('fs');
const S2A = require('stream-to-async-iterator');


(async function() {
    const readStream = fs.createReadStream(__filename);
    for await (const chunk of new S2A(readStream)) {
        console.log(chunk);
    }
})();
```


## References

- https://github.com/tc39/proposal-async-iteration
- https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-async-generator-functions
