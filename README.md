The Kal Programming Language
============================

Using Kal
---------
This section is still 'coming soon'. For now, you can clone the repository and use [http://coffeescript.org/](CoffeeScript) to run the compiler:

    coffee source/coffee/compiler.coffee [kal file]

This will print the compiled Javascript to stdout and attempt to evaluate it.

The CoffeeScript implementation is being ported over to Kal, so check back soon.

It's still in very debug mode.


Goals
-----
1. Compile to Javascript that runs in the browser or on the server
2. Allow the server and client parts of an application to share the same code base safely
3. Create a syntax that is clear and verbose, but concise where appropriate
4. Support the powerful features of Javascript without the headaches

Philosophy
----------
1. Minimize the overhead and learning curve for the programmer
2. Default to reliable, obvious behavior
3. Code should be easy to read
4. It should be easy to do things the right way.
5. It should be hard to do something in a "tricky" or "clever" way.
