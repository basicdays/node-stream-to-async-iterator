# History

## v1.0.0

-   Breaking Change: Dropping support for Node 10 and below
-   Breaking Change: Dropping support for Flow
-   Bug: Resolves #5. Event handlers are cleaned up after each iteration, fixing some memory leak issues.
-   Feature: Resolves #1. Now handles `.throw` and `.return` hooks on the async iterator
-   Feature: Added support for TypeScript
-   Feature: Support for Node.js versions 12, 14, and 16
-   Info: Resolves #7. Code no longer depends on babel runtimes or regenerator
-   Info: General overhaul of project setup (should not impact what is published)

## v0.2.0

-   Breaking Change: Renamed package from `stream-async-to-iterator` to `stream-to-async-iterator`
-   Info: deprecated incorrectly named `stream-async-to-iterator` npm package, message indicates to install new package
    name

## v0.1.0 (Deprecated)

-   Info: Initial Release
