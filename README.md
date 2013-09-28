# Kal

Kal is a highly readable, easy-to-use language that compiles to JavaScript. It's designed to be asynchronous and can run both on [node.js](http://nodejs.org/) and in the browser. Kal makes asynchronous programming easy and clean by allowing functions to [pause and wait for I/O](#asynchronous-wait-for), replacing an awkward callback syntax with a clean, simple syntax.

For an overview, see [the Github page](http://rzimmerman.github.io/kal/) or check out the [examples](https://github.com/rzimmerman/kal/tree/master/examples).

Kal is _expressive_ and offers many useful synonyms and constructs to make code readable in almost plain English.

Kal is designed with a unique philosophy:

 1. Eliminate the yucky parts of JavaScript, but keep the good stuff including the compatibility, and the great server and client runtime support.
 2. Make code as readable as possible and make writing code straightforward. Eliminate the urge (and the need) to be terse and complicated.
 3. Provide an alternative to callbacks (which look weird) and promises (which are weird) while providing excellent, easy-to-use asynchronous support.

Check out the [examples](./examples) for some sample use cases.

## Installation Using npm

This is the preferred method for installing Kal. Make sure you have installed [node.js](http://nodejs.org/). Kal works with versions 0.6, 0.8, and 0.10. It might work with other versions as well. Install the latest "stable" release of Kal using npm:

```
sudo npm install -g kal
```

`sudo` may not be required depending on how you installed `node`.

## Syntax Highlighting

A [TextMate bundle](https://github.com/rzimmerman/kal.tmbundle) for TextMate and Sublime Text is available with limited but very useful support for Kal's syntax.

[Vim support](https://github.com/bcho/kal-vim) is also available thanks to @bcho.

## Help and Support

Visit the [Google group](https://groups.google.com/forum/#!forum/kal-programming-language) to ask questions and interact.

File an issue on Github or send a pull request if you have something to add!

## Installing from the Repository

[![Build Status](https://secure.travis-ci.org/rzimmerman/kal.png?branch=master)](https://travis-ci.org/rzimmerman/kal)

If you need the latest and greatest (possibly unstable/broken) build, you can build Kal manually. Most users can skip this section and just use the latest `npm` version.

Kal is written in Kal, so you need a prebuilt version of the compiler available to do the initial build:

```
sudo npm install -g kal
```

Then you can clone the repo, install the developer dependencies, and build the compiler:

```
git clone https://github.com/rzimmerman/kal kal
cd kal
npm install
npm run-script make
```

Run the tests to make sure everything is going well:

```
npm test
```

If you're extra serious, you can use your new build to rebuild itself in case there were any notable changes to the compiler between the npm release and the latest commit. This will also run the tests.

```
npm run-script bootstrap
```

Now install your latest version using npm:

```
npm pack
```

Assuming the tests pass, this will make an archive file that you can install (the filename depends on the version):

```
sudo npm install -g kal-0.x.x.tgz
```

Alternatively you can just run the `scripts/kal` file if you don't want to install it globally.

## Usage

If you installed Kal globally (using the `-g` option), you can run the interactive shell by running `kal` with no arguments.

```
$ kal
kal> 'hello' + ' ' + 'world'
'hello world'
```

You can use the kal utility to run or compile files. Run `kal -h` for the full option set. If you installed kal locally (didn't use the -g option), you will need to specify the path to the kal executable, usually located at `node_modules/kal/scripts/kal`.

```
kal path/to/file.kal                                            --runs the specified file
kal -o path/for/output path/to/file1.kal path/to/file2.kal ...  --compiles all files/directories listed to javascript
                                                                  and writes the output into the folder specified by -o
```

Using the `-j` or `--javascript` switches will show the output of the compiler.

If you import Kal in your Javascript code, it installs a compile hook that allows you to directly import .kal files:

```javascript
require('kal');
require('./mykalfile'); //refers to mykalfile.kal
```

## Literate Kal

Literate Kal offer an exciting way to write well-documented, readable code. The idea is based on [Literate CoffeeScript](http://coffeescript.org/#literate). The compiler will treat any file with a `.litkal` or `.md` extension as a [Markdown](http://daringfireball.net/projects/markdown/) document. Code blocks, denoted by four spaces of indentation, are treated as Kal code while anything that is not indented is treated as a comment. See [this example](https://github.com/rzimmerman/kal/blob/master/examples/literate.litkal) of a Literate Kal file. New in 0.5.2.

As of 0.5.4, Kal is written in Literate Kal.

## Whitespace and Indentation

In Kal, spaces for indentation are significant and tabs are not valid. Indents are required for function definitions and blocks of code inside of `if` statements, `try`/`catch` blocks, and loops.

You should use two spaces to denote an indent. You can technically use any multiple of two spaces, but two is recommended as a style guideline. Any whitespace on blank lines is ignored. Semicolons at the end of statements are not required nor are they valid.

In general single statements cannot contain line breaks. Notable exceptions are list and object definitions. For example:

```kal
a = [1, 2,
    3,
    4]

b = {a:1
     c:2}
```

Will work, however:

```kal
a = 1 +
    1
```

Is invalid. Future versions may include better support for line breaks within statements.

## Comments

Comments are preceeded by a `#` sign. Anything after the `#` on the line will be ignored.

```kal
print 5 #this is a comment
```

Multiline comments are enclosed by `###`:

```kal
###
A multiline
comment
###
```

## Functions and Tasks

**Functions** are defined with an optional name and a list of arguments.

```kal
function my_function(arg1, arg2)
  return arg1 + arg2
```

and

```kal
my_function = function (arg1, arg2)
  return arg1 + arg2
```

Both define a variable `my_function` that takes two arguments and returns their sum. CoffeeScript syntax is also valid:

```kal
my_function = (arg1, arg2) ->
  return arg1 + arg2
```

But is generally discouraged unless it significantly helps readability. It was originally included to ease porting of the Kal compiler from CoffeeScript to Kal. Coffee-style functions must contain a line break after the `->`. `=>` is not supported.

Functions can have default arguments. These will be used if the specified argument is `null` or `undefined`:
```kal
function default_args(x,y=2)
  return x + y

print default_args(1) # prints 3
```

Functions are called using parentheses.

```kal
my_function(1, 2)
```

Will return `3`. Parentheses are optional if the function has at least one argument:

```kal
my_function 1, 2
```

Is also valid. Function calls can be chained this way as well, so any of the following

```kal
print(my_function(1,2))
print my_function 1, 2
print my_function(1, 2)
```

will all print `3`. When calling a function with no arguments, parentheses are required.

**Tasks** are similar to functions, except that they are intended to be called asynchronously (usually using a `wait for` statement).

```kal
task my_task(arg)
  return arg * 2
```

or

```kal
my_task = task (arg)
  return arg * 2
```

Tasks should not be called synchronously. If a task is called synchronously, it will return with no value. When called asynchronously.

```kal
print my_task 1
```

Is valid syntax, but will print `undefined`.

```kal
wait for x from my_task(1)
print x
```

Will print `2` as expected. See the `wait for` section for more details on asynchronous calls.

## Objects and Arrays

Objects and arrays are defined similarly to JavaScript. Newlines **are** valid inside of an array or object definition and indentation is ignored. Commas are optional when followed by a newline. CoffeeScript-style object definitions (no `{}`s) are only valid in assignments and must be preceded by a newline.

```kal
a = [1, 2, 3]
b = [1
     2,
     3
     4]
c = {a:1,b:2,c:{d:3}}
d =
  a:1, b:2
  c:
    d:3
```

Function definitions are only valid in CoffeeScript-style object definitions at this time.

```kal
d =
  a:1, b:2
  c:
    d: function ()
      return 2
    e: ->
      return 3
```

Objects work like JavaScript objects (because they are JavaScript objects), so you can access members either using array subscripts or `.` notation

```kal
x =
  a : 1
  b : 2
print x['a'] #prints 1
print x.b    #prints 2
```

## Scoping

Variables are declared automatically and scoped within the current function unless used globally (like CoffeeScript).

By default, nothing in your `.kal` file will leak to the global scope. Everything is wrapped within a function scope inside the module. If you need to export variables to global scope, you should use

```kal
module.exports.my_export = my_variable_or_function # in node.js
window.my_export = my_variable_or_function         # in a browser
```

_or_ you can compile the file with the `--bare` option.

## Conditionals

The following defines a conditional statement:

```kal
x = 5
if x is 5
  print 'five'
```

will print `five`.

```kal
x = 6
if x is 5
  print 'five'
else
  print 'not five'
```

will print `not five`

The conditional has useful synonyms:

* `when` is equivalent to `if`
* `unless` is equivalent to `if not`
* `except when` is equivalent to `if not`
* `otherwise` is equivalent to `else`

So the following is valid, as are other permutations:

```kal
unless name is 'Steve'
  print 'Impostor!'
otherwise
  print 'Steve'
```

`else` (and synonyms) can be chained with `if` (and synonyms), so

```kal
if name is 'Steve'
  print 'Steve'
else if name is 'Brian'
  print 'Brian'
otherwise when name is 'Joe'
  print 'Joe'
else
  print 'Somebody'
```

is valid.

Conditionals can also tail a statement:

```kal
print 5 if 5 > 10
```

will do nothing.

Conditionals can be used in a ternary statement as well

```kal
print(5 if name is 'Joe' otherwise 6)
```

will print `5` if the variable name is equal to `'Joe'`, otherwise it will print `6`. Kind of like it says. Parentheses are required because tail conditionals associate right, meaning the following are equivalent:

```kal
print 5 if name is 'Joe' otherwise 6
(print(5) if name is 'Joe') otherwise 6
```

## Loops

`for` loops work as follows:

```kal
for x in [1,2,3]
  print x
```

Will print the numbers 1, 2, and 3. The value n the right of the `for ... in` expression is called the `iterant`. Currently it must be an array. Python-like iterable object support is coming soon.

`for ... in` loops can also have an index variable:

```kal
for x at index in [10,20,30]
  print index, x
```

Will print the `0 10`, `1 20`, `2 30`.

`for` loops can also be used on objects:

```kal
obj = {a:1,b:2}
for key of obj
  print key, obj[key]
```

Will print `a 1` and `b 2`.

When used on asynchronous code, the `parallel` and `series` specifiers are available:

```kal
for parallel x in y
  wait for z from f(x)

for series x in y
  wait for z from f(x)
```

`series` is the default if neither is specified. Parallel for loops are **not** guaranteed to execute in order! In fact, they often won't. Take special care when accessing variables separated by `wait for` asynchronous statements. Remember that a `wait for` releases control of execution, so other loop iterations running in parallel may alter local variables if you are not careful. See the `wait for` section for more details.

`while` loops continuously run their code block until a condition is satisfied.

```kal
x = 0
while x < 5
  x += 1
  print x
```

prints the numbers 1 through 5. `until` provides a similar function.

```kal
x = 0
until x is 5
  x += 1
  print x
```

## Comprehensions

List comprehensions are a quick and useful way to create an array from another array:

```kal
y = [1,2,3]
x = [value * 2 for value in y]
```

will set `x` equal to `[2,4,6]`. Comprehensions also support an iterable object. Iterable objects support a `next()` method which returns the next value in the sequence each time it is called. When there are no more values in the sequence, it should return `null`.

```kal
class RandomList:
  method initialize(size)
    me.counter = size
  method next()
    me.counter -= 1
    if me.counter >= 0
      return Math.random()
    else
      return null

x = [r * 10 for r in new RandomList(20)]
```

will set `x` to an array of 20 random numbers between 0 and 10.

List comprehensions work on objects, too:

```kal
obj = {a:1, b:2}
x = [p for property p in obj]               # ['a','b']
x = [v for property value v in obj]         # [1, 2]
x = [p+v for propert p with value v in obj] # ['a1', 'b2']
```

Conditionals in list comprehensions are coming soon.

## Operators And Constants

Listed below are Kal's operators and their other-language equivalents. Note that Kal has a lot of synonyms for some keywords, all of which compile to the same function.

| Kal                        | CoffeeScript            | JavaScript                | Function                       |
|:--------------------------:|:-----------------------:|:-------------------------:|--------------------------------|
| `true`, `yes`, `on`        | `true`, `yes`, `on`     | `true`                    | Boolean true                   |
| `false`, `no`, `off`       | `false`, `no`, `off`    | `false`                   | Boolean false                  |
| `and`, `but`               | `and`                   | `&&`                      | Boolean and                    |
| `or`                       | `or`                    | <code>&#124;&#124;</code> | Boolean or                     |
| `nor`                      | none                    | none                      | Boolean or, inverted           |
| `not`                      | `not`, `!`              | `!`                       | Boolean not                    |
| `xor`, `bitwise xor`       | `^`                     | `^`                       | Bitwise xor                    |
| `bitwise not`              | `~`                     | `~`                       | Bitwise not (invert)           |
| `bitwise and`              | `&`                     | `&`                       | Bitwise and                    |
| `bitwise or`               | <code>&#124;</code>     | <code>&#124;</code>       | Bitwise or                     |
| `bitwise left`             | `<<`                    | `<<`                      | Bitwise shift left             |
| `bitwise right`            | `>>`                    | `>>`                      | Bitwise shift right            |
| `+`, `-`, `*`, `/`, `mod`  | `+`, `-`, `*`, `/`, `%` | `+`, `-`, `*`, `/`, `%`   | Math operators                 |
| `^`                        | none                    | none                      | Exponent (`Math.pow`)          |
| `exists`, `?`              | `?`                     | none                      | Existential check              |
| `doesnt exist`             | none                    | none                      | Existential check (inverted)   |
| `is`, `==`                 | `is`, `==`              | `===`                     | Boolean equality               |
| `isnt`, `is not`, `!=`     | `isnt`, `==`            | `!==`                     | Boolean inequality             |
| `>`, `>=`, `<`, `<=`       | `>`, `>=`, `<`, `<=`    | `>`, `>=`, `<`, `<=`      | Boolean comparisons            |
| `me`, `this`               | `@`, `this`             | `this`                    | Current object                 |
| `in`, `not in`             | `in`, `not in`          | none                      | Boolean search of array/string |
| `of`                       | `of`                    | `in`                      | Boolean search of object       |
| `nothing`, `empty`, `null` | `null`                  | `null`                    | Null value                     |
| `undefined`                | `undefined`             | `undefined`               | no value                       |
| `instanceof`               | `instanceof`            | `instanceof`              | inheritance check              |
| `print`                    | `console.log`           | `console.log`             | alias for `console.log`        |

## Exisential Checks

Kal implements the same existential operator features of CoffeeScript, with the addition of the `exists` and `doesnt exist` keyword suffixes, which perform the same function as the `?` operator. Examples:

```kal
a = {a:1}
b = [1,2,3]

print(c exists) # false
print(c doesnt exist) #true
print(c?) #false

print(c.something) #throws an error!
print(c?.something) #prints undefined

print(a?.a) # 1
print(a?.a?) # true
print(b?[2]) # 3

print c() # error!
print c?() # prints undefined
```

## Classes and Inheritence

Classes are defined with member `method` definitions. Methods are just functions that are added to the prototype of new instance objects (in other words, they are available to all instances of a class). The `initialize` method, if present, is used as the constructor when the `new` keyword is used. `me` (or its synonym `this`) is used in methods to access the current instance of the class. `instanceof` checks if an object is an instance of a class.

```kal
class Person
  method initialize(name)
    me.name = name
  method printName()
    print me.name
  method nameLength()
    return me.name.length

jen = new Person('Jen')
jen.printName() # prints 'Jen'
print(jen instanceof Person) # prints true
```

Classes can inherit from other classes and override or add to their method definitions. The `super` keyword can be used in a method to call the same function in the parent class.

```kal
class FrumpyPerson inherits from Person
  method printName()
    print 'Frumpy ' + me.name
  method nameLength()
    return 0

sue = new FrumpyPerson('Sue')
sue.printName() # prints 'Frumpy Sue'
print(sue instanceof Person) # prints true
print(sue instanceof FrumpyPerson) # prints true
print(jen instanceof FrumpyPerson) # prints false
```

You can add or alter a method or task to a class after it is defined (or from another file) using late binding using the `of` keyword.

```kal
class MyClass
  method my_method(v)
    me.v = v

x = new MyClass()
x.my_method(10)
print x.v # prints 10

method my_method(v) of MyClass
  me.v = v + 1

method my_other_method() of MyClass
  print me.v

x = new MyClass()
x.my_method 10
x.my_other_method() # prints 11
```

## Try/Catch

`try` and `catch` blocks work similarly to JavaScript/CoffeeScript. `finally` blocks are not supported yet but are coming eventually. The `throw` statement (and its synonyms `raise` and `fail with`) work like JavaScript as well.

```kal
try
  a = 'horse' / 2 # what are we doing? this will throw an error!
  b = 1 # never runs
catch e
  print 'caught it!', e
```

The `e` variable above stores the error object thrown with `throw` or by the system. You can give it any name you want and it is optional. The following is valid:

```kal
try
  throw 'a string'
  b = 1 # never runs
catch
  print 'caught it!'
```

`try`/`catch` blocks can be nested. `try` blocks can contain asynchronous `wait for` calls, but `catch` blocks cannot at this time.

## Strings

Strings can either be double-quoted (`"`) or single quoted (`'`). Backslashes can be used to escape quotes within strings if necessary.

```kal
x = 'this is a "string" with quotes in it'
y = "so is 'this'"
z = 'this one is, \'too\' but I\'m not proud of it'
```

## String Interpolation

Double-quoted strings can contain interpolated values using `#{...}` blocks. These blocks can contain any valid Kal expression (including variables and function calls). This is the recommended way to do string concatenation as it is usually more readable.

```kal
print "This is a string with the number 3: #{1+1+1}"
"This is a string with the number 3: 3"

a = cow
n = moo
print "The #{a} says #{n}, #{n}, #{n}!"
"The cow says, moo, moo, moo!"
```

## Regular Expressions

Kal supports JavaScript's regex syntax, but not CoffeeScript style block regex syntax.

## Asynchronous Wait For

The `wait for` statement executes a `task` and pauses execution (yielding to the runtime) until the `task` is complete. The following reads a file asynchronously and prints its contents (in node.js).

```kal
fs = require 'fs'
wait for data from fs.readFile '/home/user/file.txt'
print data.toString()
```

Note that:

* For users familiar with node.js and JavaScript, `fs.readFile` is called with the file name argument and a callback. **You don't need to supply a callback.**
* After the `wait for` line, execution is paused and other code can run. Keep this in mind if you have global variables that are modified asynchronously as they may change between the `wait for` line and the line after it.
* Any errors reported by `fs.readFile` (returned via callback) **will be thrown automatically**. You should wrap the `wait for` in a `try`/`catch` if you want to catch these errors.

`wait for` can be used to call your own asynchronous tasks. It can also be used within `for` and `while` loops, `try` blocks, `if` statements, and **any nesting combination** you can think of. Really!

```kal
fs = require 'fs'
task readFileSafe(filename)
  if 'secret' in filename
    throw 'Illegal Access!'
  else
    wait for d from fs.readFile filename
    return d

for parallel filename in ['secret/data.txt', 'test.txt', 'test2.txt']
  try
    wait for data from readFileSafe '/home/secret/file.txt'
    print data.toString()
  catch error
    print "ERROR: #{error}"
print 'DONE!'
```

`wait for` can also be used without arguments by omitting the `from` keyword

```kal
wait for my_task()
```

Some node.js API functions (like `http.get`) don't follow the normal convention of calling back with an error argument. For these functions you must use the `safe` prefix, otherwise it will throw an error:

```kal
http = require 'http'
safe wait for request from http.get 'http://www.google.com'
print request.responseCode
```

`wait for` statements also support multiple return values

```kal
wait for a, b from my_task()
```

## Asynchronous Pause

You can pause for a specified amount of time using the `pause for` keyword

```kal
print 'starting'
pause for 1 second
print 'done!'
```

`pause for` uses JavaScript's `setTimeout` function. Note that the argument is in seconds, not milliseconds like `setTimeout`.

The `second` keyword is optional. `seconds` also works. Use your best judgement to keep your code readable.

```kal
pause for 2          # seconds is implied
pause for 10 seconds # also valid
milliseconds = 1293
pause for milliseconds/1000 seconds # expressions are valid for the timeout
```

## Parallel Tasks

You can kick off tasks in parallel with the `run in parallel` block

```kal
run in parallel
  task1()
  wait for task2 a, b, c
  wait for x from task3()
  safe wait for y, z from task4()
print 'all tasks finished'
```

Code after the `run in parallel` block will not run until all tasks have completed. If any errors are thrown by one or more tasks, an array of errors will be thrown after all tasks in the block complete (or fail). Array elements are in the order that the tasks were specified. If no error was thrown by a task, its error element will be `undefined` (`doesnt exist` will be true). `safe` waits will not check for errors.

```kal
try
  run in parallel
    task_that_fails()
    task_that_succeeds()
catch errors
  print errors[0] # prints the error thrown by task_that_fails
  print errors[1] exists # prints false
```
