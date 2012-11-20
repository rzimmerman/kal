(function () {
  var coffee, sugar, lexer, parser, generator, fs, assert, code;
  
  coffee = require('coffee-script');
  sugar = require('../coffee/sugar');
  lexer = require('./lexer');
  parser = require('../coffee/parser');
  generator = require('../coffee/generator');
  function compile (code) {
    var token_rv, raw_tokens, comments, tokens, root_node;
    token_rv = lexer.tokenize(code);
    raw_tokens = token_rv[0];
    comments = token_rv[1];
    
    tokens = sugar.translate_sugar(raw_tokens);
    root_node = parser.parse(tokens, comments);
    generator.load(parser.Grammar);
    
    return root_node.js();
    
  };
  fs = require('fs');
  assert = require('assert');
  if (process.argv[2] != null) {
    code = compile(fs.readFileSync(process.argv[2]));
  }
  if (process.argv[3] != null) {
    fs.writeFileSync(process.argv[3], code);
    
  } else {
    console.log(code);
    
    console.log(eval(code));
    
  }
})()
