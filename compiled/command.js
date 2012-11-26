(function () {
  var fs, path, optimist, Kal, run;
  
  /* External dependencies.*/
  fs = require('fs');
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
    
    optimist = optimist.options('tokens', { alias: 't', boolean: true, description: 'print out the tokens that the lexer/sugar produce' });
    
    optimist = optimist.options('javascript', { alias: 'j', boolean: true, description: 'print out the javascript output of the compiler' });
    
    optimist = optimist.options('version', { alias: 'v', boolean: true, description: 'display the version number' });
    
    optimist = optimist.options('output', { alias: 'o', description: 'the output directory for the compiled source' });
    
    return optimist.argv;
    
  };
  run = function run () {
    var options, ki$1, kobj$1, file_name, js_output;
    options = parseOptions();
    
    if (options.version) {
    return version();
    }
    
    if (optimist.argv.help || optimist.argv._.length === 0) {
    return usage();
    }
    
    if ((options.output != null) && !(fs.existsSync(options.output))) {
      printWarn('output path does not exist!');
      
      return usage();
      
    }
    process.argv[0] = 'kal';
    
    process.execPath = require.main.filename;
    
    kobj$1 = options._;
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      file_name = kobj$1[ki$1];
        js_output = Kal.compile(fs.readFileSync(file_name), options.tokens);
        
        (options.javascript) ? printLine(js_output) : void 0;
        
        if ((options.output != null)) {
          fs.writeFileSync(options.output + '/' + file_name.split('/').slice(-1)[0].replace('.kal', '.js'), js_output);
          
        } else {
          printLine(eval(js_output));
          
        }
    }
  };
  exports.run = run;
  function version () {
    printLine("Kal version " + (Kal.VERSION));
    
    return 0;
    
    
  };
  function usage () {
    optimist.showHelp();
    
    return 2;
    
    
  };
})()
