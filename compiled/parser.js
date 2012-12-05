(function () {
  var grammar, GrammarRoot, Grammar;
  
  grammar = require('./grammar');
  GrammarRoot = grammar.GrammarRoot;
  Grammar = grammar.Grammar;
  exports.Grammar = Grammar;
  function parse (tokens, comments, options) {
    var ts, AST;
    ts = new  TokenStream(tokens, comments, options);
    
    AST = new  GrammarRoot(ts);
    
    return AST;
    
  };
  exports.parse = parse;
  function TokenStream (tokens, comments, options) {
        this.tokens = tokens;
      
      this.comments = comments;
      
      this.options = options;
      
      this.goto_token(0);
      
    }  
    TokenStream.prototype.next = function () {
        return this.goto_token(this.index + 1);
      
    };
    TokenStream.prototype.prev = function () {
        return this.goto_token(this.index - 1);
      
    };
    TokenStream.prototype.peek = function (delta_index) {
      var token;
      this.goto_token(this.index + delta_index);
      
      token = this.current;
      
      this.goto_token(this.index - delta_index);
      
      return token;
      
    };
    TokenStream.prototype.goto_token = function (index) {
        this.index = index;
      
      if (this.index > this.tokens.length - 1) {
        this.current = { type: 'EOF', text: '', line: 0, value: '' };
        
      } else     if (this.index < 0) {
        throw ('Parser Error: tried to read before beginning of file');
        
      } else {
        this.current = this.tokens[this.index];
        
      }
      this.type = this.current.type;
      
      this.text = this.current.text;
      
      this.value = this.current.value;
      
      this.line = this.current.line;
      
      return this.current;
      
      
    };
})()
