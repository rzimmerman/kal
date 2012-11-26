(function () {
  var sugar, lexer, parser, generator;
  
  sugar = require('./sugar');
  lexer = require('./lexer');
  parser = require('./parser');
  generator = require('./generator');
  exports.VERSION = '0.2.5';
  function compile (code, show_tokens) {
    var token_rv, raw_tokens, comments, tokens, root_node;
    token_rv = lexer.tokenize(code);
    
    raw_tokens = token_rv[0];
    
    comments = token_rv[1];
    
    
    tokens = sugar.translate_sugar(raw_tokens, show_tokens, lexer.tokenize);
    
    root_node = parser.parse(tokens, comments);
    
    generator.load(parser.Grammar);
    
    return root_node.js();
    
  };
  exports.compile = compile;
  if (require.extensions) {
    require.extensions['.kal'] = function  (module, filename) {
      var content;
      content = compile(require('fs').readFileSync(filename, 'utf8'));
      
      module._compile(content, filename);
      
      
    };
  }
})()
