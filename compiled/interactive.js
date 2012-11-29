  (function () {
  var stdin, stdout, Kal, readline, util, inspect, vm, Script, Module, REPL_PROMPT, REPL_PROMPT_MULTILINE, REPL_PROMPT_CONTINUATION, enableColors, ACCESSOR, SIMPLEVAR;
    var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  /* The interactive shell. Compiles one line to Javascript and
  # executes it
  
  # Start by opening up `stdin` and `stdout`.*/
  stdin = process.openStdin();
  stdout = process.stdout;
  Kal = require('./kal');
  readline = require('readline');
  util = require('util');
  inspect = util.inspect;
  vm = require('vm');
  Script = vm.Script;
  /*
  # Config*/
  Module = require('module');
  REPL_PROMPT = 'kal> ';
  REPL_PROMPT_MULTILINE = '------> ';
  REPL_PROMPT_CONTINUATION = '......> ';
  enableColors = false;
  if (!(process.platform === 'win32')) {
    /*
    # Log an error.*/
    enableColors = !(process.env.NODE_DISABLE_COLORS);
    
    function error (err) {
        stdout.write(err.stack || err.toString());
      
      /*
    ## Autocompletion
  
    # Regexes to match complete-able bits of text.*/
      stdout.write('\n');
      
    };
    ACCESSOR = /\s*([\w\.]+)(?:\.(\w*))$/;
    
    /*
    # Returns a list of completions, and the completed text.*/
    SIMPLEVAR = /(\w+)$/i;
    
    function autocomplete (text) {
        /*
    # Attempt to autocomplete a chained dotted attribute: `one.two.three`.*/
      return completeAttribute(text) || completeVariable(text) || [[], text];
      
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
          return when;
          (obj == null);
          
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
          
          /*
    # Attempt to autocomplete an in-scope free variable: `one`.*/
          return [completions, prefix];
          
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
          
          /*
    # Return elements of candidates for which `prefix` is a prefix.*/
          return [completions, free];
          
        }
      };
      function getCompletions (prefix, candidates) {
        var rv, ki$1, kobj$1, el;
        rv = [];
        
        kobj$1 = candidates;
        for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
          el = kobj$1[ki$1];
            rv.push(el(ewhen(0 === el.indexOf(prefix))));
            
        }
        /*
    # Make sure that uncaught exceptions don't kill the REPL.*/
        return rv;
        
      };
      process.on('uncaughtException', error);
      
      
    }
  })()
