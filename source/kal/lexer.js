(function () {
  var tokenize, token_types, Lexer;
  
  function tokenize (code) {
    var lex;
    lex = new  Lexer(code);
    return [lex.tokens, lex.comments];
  };
  exports.tokenize = tokenize;
  token_types = {  };
  function Lexer (code, line_number) {
        this.code = code;
      this.line = line_number || 1;
      this.indent = 0;
      this.indents = [];
      this.tokenize();
      
      
    }  
    Lexer.prototype.tokenize = function () {
      var last_token_type, index, chunk, ki$1, kobj$1, tt, regex, type, e, text, value, new_token, line, l;
      this.tokens = [];
      this.comments = [];
      last_token_type = null;
      index = 0;
      while (index < this.code.length) {
          chunk = this.code.slice(index);
          kobj$1 = (token_types);
          for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
            tt = kobj$1[ki$1];
              regex = tt[0];
              type = tt[1];
              e = regex.exec(chunk);
              text = typeof e !== 'undefined' && e !== null ? e[0] : void 0;
              if (typeof text !== 'undefined' && text !== null) {
                this.type = type;
                break;
                
              }
          }
          if (!(typeof text !== 'undefined' && text !== null)) {
    this.error("invalid token '" + me.code.slice(index,index+15) + "...'")
          };
          
          value = text;
          /* #check for indent/dedent*/        if (last_token_type === 'NEWLINE') {
            this.handleIndentation(type, text);
            
          }
          new_token = { text: text, line: this.line, value: value, type: type };
          if (type === 'COMMENT') {
            this.comments.push(new_token);
            
          } else         if (type !== 'WHITESPACE') {
            this.tokens.push(new_token);
            
          }
          index += text.length;
          l = /\n/.exec(text);
          this.line += typeof l !== 'undefined' && l !== null ? l[0].length : void 0 || 0;
          last_token_type = type;
      }
      /* #clear up any remaining indents at the end of the file*/    this.handleIndentation('NEWLINE', '');
      
      
    };
    Lexer.prototype.handleIndentation = function (type, text) {
      var indentation, new_token, line, value;
      indentation = (type === 'WHITESPACE') ? text.length : 0;
      if (indentation > this.indent) {
        this.indents.push(this.indent);
        
        this.indent = indentation;
        new_token = { text: text, line: this.line, value: '', type: 'INDENT' };
        this.tokens.push(new_token);
        
      } else     if (indentation < this.indent) {
        while (this.indents.length > 0 && indentation < this.indent) {
            this.indent = this.indents.pop();
            if (indentation > this.indent) {
    this.error('indentation is misaligned')
            };
            
            new_token = { text: text, line: this.line, value: '', type: 'DEDENT' };
            this.tokens.push(new_token);
            
        }
        if (indentation !== this.indent) {
    this.error('indentation is misaligned')
        };
        
        
      }
    };
    Lexer.prototype.error = function (message) {
        throw(message);
      
    };
  exports.Lexer = Lexer;
  token_types = [[/^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*#(?!##[^#]).*)+/, 'COMMENT'], [/^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/, 'REGEX'], [/^0x[a-f0-9]+/i, 'NUMBER'], [/^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i, 'NUMBER'], [/^'([^']*(\\'))*[^']*'/, 'STRING'], [/^"([^"]*(\\"))*[^"]*"/, 'STRING'], [/^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/, 'IDENTIFIER'], [/^(\r*\n\r*)+/, 'NEWLINE'], [/^[\f\r\t\v\u00A0\u2028\u2029 ]+/, 'WHITESPACE'], [/^[\+\-\*\/\^\=\.><\(\)\[\]\,\.\{\}\:\?]/, 'LITERAL']];
})()
