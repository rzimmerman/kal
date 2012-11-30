(function () {
  var fs, path, optimist, Kal, run;
  
  fs = require('fs'); /*External dependencies.*/
  path = require('path');
  optimist = require('optimist');
  Kal = require('./kal');
  function printLine (line) {
    process.stdout.write(line + '\n');
    
  };
  function printWarn (line) {
    process.stderr.write(line + '\n');
    
  };
  function hidden (file) {
    /^\.|~$/.test(file);
    
  };
  function parseOptions () {
    var BANNER;
    BANNER = 'Usage: kal [options] path/to/script.kal\n\nIf called without options, `kal` will run your script.\n$0';
    
    optimist = optimist.usage(BANNER);
    
    optimist = optimist.options('help', { alias: 'h', boolean: true, description: 'show the command line usage options' });
    
    optimist = optimist.options('tokens', { alias: 't', boolean: true, description: 'print out the tokens that the lexer/sugarer produce' });
    
    optimist = optimist.options('javascript', { alias: 'j', boolean: true, description: 'print out the compiled javascript' });
    
    optimist = optimist.options('bare', { alias: 'b', boolean: true, description: 'don\'t wrap the output in a function' });
    
    optimist = optimist.options('version', { alias: 'v', boolean: true, description: 'display the version number' });
    
    optimist = optimist.options('output', { alias: 'o', description: 'the output directory for the compiled source' });
    
    return optimist.argv;
    
  };
  run = function run () {
    var options, compile_options, ki$1, kobj$1, file_name, js_output;
    options = parseOptions();
    
    if (options.version) {
    return version();
    }
    
    if (optimist.argv.help) {
    return usage();
    }
    
    if ((options.output != null) && !(fs.existsSync(options.output))) {
      printWarn('output path does not exist!');
      
      return usage();
      
    }
    if (options._.length === 0) {
    return require('./interactive');
    }
    
    process.argv[0] = 'kal';
    
    process.execPath = require.main.filename;
    
    compile_options = {  };
    
    compile_options.show_tokens = options.tokens;
    
    compile_options.bare = false;
    
    compile_options.show_js = options.javascript;
    
    kobj$1 = options._;
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      file_name = kobj$1[ki$1];
        if ((options.output != null)) {
          js_output = Kal.compile(fs.readFileSync(file_name), compile_options);
          
          (options.javascript) ? printLine(js_output) : void 0;
          
          fs.writeFileSync(options.output + '/' + file_name.split('/').slice(-1)[0].replace('.kal', '.js'), js_output);
          
        } else {
          Kal.eval(fs.readFileSync(file_name), compile_options);
          
        }
    }
  };
  exports.run = run;
  function version () {
    printLine("Kal version " + (Kal.VERSION));
    
    process.exit(0);
    
  };
  function usage () {
    optimist.showHelp();
    
    process.exit(2);
    
    
  };
})()
