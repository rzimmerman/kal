    (function () {
  var stdin, stdout, Kal, readline, util, inspect, vm, Script, Module, REPL_PROMPT, REPL_PROMPT_MULTILINE, REPL_PROMPT_CONTINUATION, enableColors, ACCESSOR, SIMPLEVAR, backlog, pipedInput, repl, multilineMode;
      var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  stdin = process.openStdin();
  /*The interactive shell. Compiles one line to Javascript and
   * executes it
   * 
   * Start by opening up `stdin` and `stdout`.*/
  stdout = process.stdout;
  Kal = require('./kal');
  readline = require('readline');
  util = require('util');
  inspect = util.inspect;
  vm = require('vm');
  Script = vm.Script;
  Module = require('module'); /*Config*/
  REPL_PROMPT = 'kal> ';
  REPL_PROMPT_MULTILINE = '------> ';
  REPL_PROMPT_CONTINUATION = '......> ';
  enableColors = false;
  if (!(process.platform === 'win32')) {
    enableColors = !(process.env.NODE_DISABLE_COLORS); /*Log an error.*/
    
  }
  function error (err) {
    stdout.write(err.stack || err.toString());
    
    stdout.write('\n');
  /*Autocompletion
   * 
   * Regexes to match complete-able bits of te*/
    
  };
  ACCESSOR = /\s*([\w\.]+)(?:\.(\w*))$/;
  SIMPLEVAR = /(\w+)$/i; /*Returns a list of completions, and the completed text.*/
  function autocomplete (text) {
    return completeAttribute(text) || completeVariable(text) || [[], text]; /*Attempt to autocomplete a chained dotted attribute: `one.two.three`.*/
    
  };
  function completeAttribute (text) {
      var match, all, obj, prefix, candidates, ki$1, kobj$1, key, completions;
    match = text.match(ACCESSOR);
    
    if (match) {
      all = match[0];
      
      obj = match[1];
      
      prefix = match[2];
      
      try {
          obj = Script.runInThisContext(obj);
              } catch (e) {
          return;
          }
        if ((obj == null)) {
    return;
        }
        
        obj = Object(obj);
        
        candidates = Object.getOwnPropertyNames(obj);
        
        obj = Object.getPrototypeOf(obj);
        
        while (obj) {
            kobj$1 = Object.getOwnPropertyNames(obj);
            for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
              key = kobj$1[ki$1];
                (!(($kindexof.call(candidates, key) >= 0) )) ? candidates.push(key) : void 0;
                
            }
            obj = Object.getPrototypeOf(obj);
            
        }
        completions = getCompletions(prefix, candidates);
        
        return [completions, prefix]; /*Attempt to autocomplete an in-scope free variable: `one`.*/
        
      }
    };
    function completeVariable (text) {
      var free, vars, keywords, ki$1, kobj$1, r, candidates, key, completions;
      free = ((text.match(SIMPLEVAR) != null) ? text.match(SIMPLEVAR)[1] : void 0);
      
      if (text === "") {
    free = "";
      }
      
      if ((free != null)) {
        vars = Script.runInThisContext('Object.getOwnPropertyNames(Object(this))');
        
        keywords = [];
        
        kobj$1 = CoffeeScript.RESERVED;
        for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
          r = kobj$1[ki$1];
            (r.slice(0, 2) !== '__') ? kewords.push(r) : void 0;
            
        }
        candidates = vars;
        
        kobj$1 = keywords;
        for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
          key = kobj$1[ki$1];
            (!((($kindexof.call(candidates, key) >= 0) ))) ? candidates.push(key) : void 0;
            
        }
        completions = getCompletions(free, candidates);
        
        return [completions, free]; /*Return elements of candidates for which `prefix` is a prefix.*/
        
      }
    };
    function getCompletions (prefix, candidates) {
      var rv, ki$1, kobj$1, el;
      rv = [];
      
      kobj$1 = candidates;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        el = kobj$1[ki$1];
          (0 === el.indexOf(prefix)) ? rv.push(el) : void 0;
          
      }
      return rv; /*Make sure that uncaught exceptions don't kill the REPL.*/
      
    };
    process.on('uncaughtException', error); /*The current backlog of multi-line code.*/
    backlog = '';
  /*The main REPL function. **run** is called every time a line of code is entered.
   * Attempt to evaluate the command. If there's an exception, print it out instead
   * of exiting.*/
    function run (buffer) { /*remove single-line comments*/
        var code, _, returnValue;
      buffer = buffer.replace(/(^|[\r\n]+)(\s*)##?(?:[^#\r\n][^\r\n]*|)($|[\r\n])/, "$1$2$3"); /*remove trailing newlines*/
      
      buffer = buffer.replace(/[\r\n]+$/, "");
      
      if (multilineMode) {
        backlog += ("" + buffer + "\n");
        
        repl.setPrompt(REPL_PROMPT_CONTINUATION);
        
        repl.prompt();
        
        return;
        
      }
      if (!(buffer.toString().trim()) && !(backlog)) {
        repl.prompt();
        
        return;
        
      }
      backlog += buffer;
      
      code = backlog;
      
      if (code[code.length - 1] === '\\') {
        backlog = ("" + (backlog.slice(0, -1)) + "\n");
        
        repl.setPrompt(REPL_PROMPT_CONTINUATION);
        
        repl.prompt();
        
        return;
        
      }
      repl.setPrompt(REPL_PROMPT);
      
      backlog = "";
      
      try {
          _ = global._;
          
          returnValue = Kal.eval(("" + code), { filename: 'repl', modulename: 'repl' });
          
          if (returnValue === undefined) {
            global._ = _;
            
          }
          repl.output.write("" + (inspect(returnValue, false, 2, enableColors)) + "\n");
              } catch (err) {
          error(err);
          }
        repl.prompt();
        
      };
      if (stdin.readable && stdin.isRaw) { /*handle piped input*/
        pipedInput = '';
        
        repl = {  };
        
        repl.prompt = function  () {
                stdout.write(this._prompt);
          
        };
        repl.setPrompt = function  (p) {
                this._prompt = p;
          
        };
        repl.input = stdin;
        
        repl.output = stdout;
        
        repl.on = function  () {
                return;
          
        };
        stdin.on('data', function  (chunk) {
          var nlre, lines, ki$1, kobj$1, line;
          pipedInput += chunk;
          
          nlre = /\n/;
          
          if (!(nlre.test(pipedInput))) {
    return;
          }
          
          lines = pipedInput.split("\n");
          
          pipedInput = lines[lines.length - 1];
          
          kobj$1 = lines.slice(1, -1);
          for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
            line = kobj$1[ki$1];
              if (line) {
                stdout.write("" + line + "\n");
                
                run(line);
                
              }
          }
          return;
          
        });
        stdin.on('end', function  () {
          var ki$1, kobj$1, line;
          kobj$1 = pipedInput.trim().split("\n");
          for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
            line = kobj$1[ki$1];
              if (line) {
                stdout.write("" + line + "\n");
                
                run(line);
                
              }
          }
          stdout.write("\n");
          
          process.exit(0);
          
        });
      } else {
        if (readline.createInterface.length < 3) { /*Create the REPL by listening to **stdin**.*/
          repl = readline.createInterface(stdin, autocomplete);
          
          stdin.on('data', function  (buffer) {
                    repl.write(buffer);
            
          });
        } else {
          repl = readline.createInterface(stdin, stdout, autocomplete);
          
        }
      }
      multilineMode = false; /*Handle multi-line mode switch*/
      repl.input.on('keypress', function  (char, key) { /*test for Ctrl-v*/
        var cursorPos, newPrompt;
        if (!(key && key.ctrl && !(key.meta) && !(key.shift) && key.name === 'v')) {
    return;
        }
        
        cursorPos = repl.cursor;
        
        repl.output.cursorTo(0);
        
        repl.output.clearLine(1);
        
        multilineMode = !(multilineMode);
        
        (!(multilineMode) && backlog) ? repl._line() : void 0;
        
        backlog = '';
        
        if (multilineMode(othewise(REPL_PROMPT))) {
    newPrompt = REPL_PROMPT_MULTILINE;
        }
        
        repl.setPrompt(newPrompt);
        
        repl.prompt();
        
        repl.cursor = cursorPos;
        
        repl.output.cursorTo(newPrompt.length + (repl.cursor)); /*Handle Ctrl-d press at end of last line in multiline mode*/
        
      });
      repl.input.on('keypress', function  (char, key) {
            if (!(multilineMode && repl.line)) { /*test for Ctrl-d*/
    return;
        }
        
        if (!(key && key.ctrl && !(key.meta) && !(key.shift) && key.name === 'd')) {
    return;
        }
        
        multilineMode = false;
        
        repl._line();
        
      });
      repl.on('attemptClose', function  () {
            if (multilineMode) {
          multilineMode = false;
          
          repl.output.cursorTo(0);
          
          repl.output.clearLine(1);
          
          repl._onLine(repl.line);
          
          return;
          
        }
        if (backlog || repl.line) {
          backlog = '';
          
          repl.historyIndex = -1;
          
          repl.setPrompt(REPL_PROMPT);
          
          repl.output.write('\n(^C again to quit)');
          
          repl.line = '';
          
          repl._line(repl.line);
          
        } else {
          repl.close();
          
        }
      });
      repl.on('close', function  () {
            repl.output.write('\n');
        
        repl.input.destroy();
        
      });
      repl.on('line', run);
      repl.setPrompt(REPL_PROMPT);
      repl.prompt();
    })()
