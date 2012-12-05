  (function () {
  var sugar, lexer, parser, generator;
    
  sugar = require('./sugar');
  lexer = require('./lexer');
  parser = require('./parser');
  generator = require('./generator');
  exports.VERSION = '0.3.1';
  function compile (code, options) {
      var token_rv, raw_tokens, comments, tokens, root_node;
    if ((options == null)) {
      options = { bare: false };
      
    }
    try {
        token_rv = lexer.tokenize(code);
        
        raw_tokens = token_rv[0];
        
        comments = token_rv[1];
        
        tokens = sugar.translate_sugar(raw_tokens, options, lexer.tokenize);
        
        root_node = parser.parse(tokens, comments);
        
        generator.load(parser.Grammar);
        
        return root_node.js(options);
          } catch (e) {
        console.error(e.message);
        
        return '';
        }
    };
    exports.compile = compile;
    if (require.extensions) {
      require.extensions['.kal'] = function  (module, filename) {
        var content;
        content = compile(require('fs').readFileSync(filename, 'utf8'));
        
        module._compile(content, filename);
        
      };
    }
    exports.eval = function  (code, options) {
      var vm, path, Script, sandbox, ki$1, kobj$1, k, Module, _module, _require, r, o, js;
      if ((options == null)) {
    options = {  };
      }
      
      code = code.toString().trim();
      
      if (code === "") {
    return;
      }
      
      vm = require('vm');
      
      path = require('path');
      
      Script = vm.Script;
      
      if (Script) {
        if ((options.sandbox != null)) {
          if (options.sandbox instanceof Script.createContext().constructor) {
            sandbox = options.sandbox;
            
          } else {
            sandbox = Script.createContext();
            
            kobj$1 = options.sandbox;
  for (k in kobj$1) {
                if (options.sanbox.hasOwnProperty(k)) {
    sandbox[k] = options.sandbox[k];
                }
                
            }
          }
          sandbox.GLOBAL = sandbox;
          
          sandbox.root = sandbox;
          
          sandbox.global = sandbox;
          
        } else {
          sandbox = global;
          
        }
        sandbox.__filename = options.filename || 'eval';
        
        sandbox.__dirname = path.dirname(sandbox.__filename); /*define module/require only if they chose not to specify their own*/
        
        if (!(sandbox !== global || sandbox.module || sandbox.require)) {
          Module = require('module');
          
          _module = new  Module(options.modulename || 'eval');
          
          sandbox.module = _module;
          
          _require = function  (path) {
                    Module._load(path, _module, true);
            
          };
          sandbox.require = _require;
          
          _module.filename = sandbox.__filename;
          
          kobj$1 = Object.getOwnPropertyNames(require);
          for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
            r = kobj$1[ki$1];
              if (r !== 'paths') {
                _require[r] = require[r]; /*use the same hack node currently uses for their own REPL*/
                
              }
          }
          _module.paths = Module._nodeModulePaths(process.cwd());
          
          _require.paths = _module.paths;
          
          _require.resolve = function  (request) {
                    Module._resolveFilename(request, _module);
            
          };
        }
      }
      o = {  };
      
      kobj$1 = options;
  for (k in kobj$1) {
          if (options.hasOwnProperty(k)) {
            o[k] = options[k];
            
          }
      }
      o.bare = true; /*ensure return value*/
      
      js = compile(code, o);
      
      (options.show_js) ? console.log(js) : void 0;
      
      if (sandbox === global) {
        return vm.runInThisContext(js);
        
      } else {
        return vm.runInContext(js, sandbox);
        
        
      }
    };
  })()
