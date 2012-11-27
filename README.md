The Kal Programming Language
============================

Using Kal
---------
This section is still 'coming soon'. A detailed syntax guide is in work, but if you want to try it out, the syntax is a lot like CoffeeScript with some notable exceptions. Check out the source/*.kal files to see some examples.

Installation
------------
Install using npm:

    npm install -g kal

You may need to run this as administrator depending on how you installed node/npm and your account setup:

    sudo npm install -g kal

You can also install kal locally as a project dependency by including 'kal' in your package.json.

Compiling and Running Kal Files
-------------------------------
You can use the kal utility to run or compile files. Run `kal -h` for the full option set. If you installed kal locally (didn't use the -g option), you will need to specify the path to the kal executable, usually located at `node_modules/kal/scripts/kal`.

    kal path/to/file.kal                                            --runs the specified file
    kal -o path/for/output path/to/file1.kal path/to/file2.kal ...  --compiles all files (wildcards ok) listed to javascript
                                                                      and writes the output into the folder specified by -o

Using the `-j` or `--javascript` switches will show the output of the compiler.

As of version 0.2.0, the CoffeeScript dependency has been removed. The compiler now compiles itself as follows:

    kal -o /output/path source/*.kal

If you import Kal in your Javascript code, it installs a compile hook that allows you to directly import .kal files:

    require('kal');
    require('./mykalfile'); //refers to mykalfile.kal

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
