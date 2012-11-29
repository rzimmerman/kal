#Change Log

### [0.2.9](https://github.com/rzimmerman/kal/compare/r0.2.8...r0.2.9)
* Significant performance improvements for compile time
* Fixed the command line options to the `kal` executable
* Much better error reporting for syntax errors
* Fixed a bug to allow no-parentheses function calls in for and while loop headers

### [0.2.8](https://github.com/rzimmerman/kal/compare/r0.2.7...r0.2.8)
* Fixed some issues with escape sequences in strings
* Fixed some issues with conditional return statements
* Included an interactive shell which now runs be default if you run `kal` with no arguments.

### [0.2.7](https://github.com/rzimmerman/kal/compare/r0.2.6...r0.2.7)
* Added a proper npmignore file to reduce the package size
* Added this change log
* Added support for reserved words as properties and function calls to reserved word properties

### [0.2.6](https://github.com/rzimmerman/kal/compare/r0.2.5...r0.2.6)
* Now correctly parses and compiles expressions inside of double-quoted strings. Previous versions just
  treated these as Javascript
* Added support for the `super` keyword

### [0.2.5](https://github.com/rzimmerman/kal/tree/8d994cca210638b2ac2518a2f7bbe598e067a418) - Nov 25 2012
* Fixes reported version (was reporting 0.2.3 for version 0.2.4)

### [0.2.4](https://github.com/rzimmerman/kal/tree/c6a34fc132f15a10b787e5814d89648e27061aee) - Nov 25 2012
* Added a `kal` command line tool
* Still reports version 0.2.3 in some places (bug)

### [0.2.3](https://github.com/rzimmerman/kal/tree/f5a8cac5bace0a3d96b92f4d125a09026a4b9ae2) - Nov 25 2012
* Fixes to trailing conditionals on function calls with implicit parentheses

### [0.2.2](https://github.com/rzimmerman/kal/tree/4798522fef3e41fc40f2b7819cd41c75a1b1f16a) - Nov 25 2012
* Fixed the npm package.json file (was causing failed installs)

### [0.2.1](https://github.com/rzimmerman/kal/tree/914db52fa3a158c36b22bbde3480d9d8ba5bec3f) - Nov 25 2012
* Added support for negative unary expressions (`-3`)
* Added support for `!=` and `==`
* Full support for function calls without parentheses
* Added support for `not in` and `not of` operators
* Removed CoffeeScript source files

### [0.2.0](https://github.com/rzimmerman/kal/tree/63075434b0343520d0c4f9c7a0460742108d96b9) - Nov 24 2012
* Removed dependency on CoffeeScript, thought the .coffee files are still included for reference

### [0.1.0](https://github.com/rzimmerman/kal/tree/021497d75468bd648bf36944d5ab528f7185b8c9) - Nov 24 2012
* Initial release