The Kal Programming Language
============================

Using Kal
---------
This section is still 'coming soon'. A detailed syntax guide is in work, but if you want to try it out, the syntax is a lot like CoffeeScript with some notable exceptions. Check out the source/kal files to see some examples. For now, you can clone the repository to run the compiler as follows:

    node ./compiled/kal (kal file) [js output file]
    node ./compiled/kal -c (source files) (output directory)

This will print the compiled Javascript to stdout and attempt to evaluate it if you don't specify "js output file".

As of version 0.2.0, the CoffeeScript dependency has been removed. The .coffee source is still available but will be
removed in version 0.3.0. The compiler now compiles itself as follows:

    node ./compiled/kal -c ./source/kal/*.kal (output directory)


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
