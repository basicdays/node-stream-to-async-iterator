# History

## v1.0.0-beta.1

- Bug: Resolves #5. Event handlers are cleaned up after each iteration, fixing some memory leak issues.
- Info: Resolves #7. Code now internally depends on `@babel/runtime`. This fixes issue where a global
  `regeneratorRuntime` was required.
- Breaking: Updated node support to be >= node 6.0.

## v0.2.1

- Info: Added npm/travis badges to README.md

## v0.2.0

- Breaking Change: Renamed package from `stream-async-to-iterator` to `stream-to-async-iterator`
- Info: deprecated incorrectly named `stream-async-to-iterator` npm package, message indicates to install new package
  name

## v0.1.0 (Deprecated)

- Info: Initial Release
