(function () {
  var parse_token, token_types;
  
  function tokenize (code) {
    var lex;
    lex = new  Lexer(code);
    
    return [lex.tokens, lex.comments];
    
  };
  exports.tokenize = tokenize;
  function Lexer (code, line_number) {
        this.code = code;
      
      this.line = line_number || 1;
      
      this.indent = 0;
      
      this.indents = [];
      
      this.tokenize();
      
    }  
    Lexer.prototype.tokenize = function () {
      var last_token_type, index, chunk, ki$1, kobj$1, tt, regex, type, text, code, context_len, value, comment_token;
      this.tokens = [];
      
      this.comments = [];
      
      last_token_type = null;
      
      index = 0;
      
      while (index < this.code.length) {
          chunk = this.code.slice(index);
          
          kobj$1 = token_types;
          for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
            tt = kobj$1[ki$1];
              regex = tt[0];
              
              type = tt[1];
              
              text = ((regex.exec(chunk) != null) ? regex.exec(chunk)[0] : void 0);
              
              if ((text != null)) {
                this.type = type;
                
                break;
                
              }
          }
          if (!(text)) {
            code = this.code.toString().trim();
            
            context_len = (code.length >= 16) ? 16 : code.length;
            
            (!((text != null))) ? this.error(("invalid token '" + (code.slice(index, index + context_len)) + "...' on line " + (this.line))) : void 0;
            
          }
          value = parse_token[this.type](text);
          
          if (last_token_type === 'NEWLINE') { /*check for indent/dedent*/
            this.handleIndentation(type, text);
            
          }
          if (type === 'COMMENT') {
            comment_token = { text: text, line: this.line, value: value, type: type };
            
            if (((this.tokens[this.tokens.length - 1] != null) ? this.tokens[this.tokens.length - 1].type : void 0) === 'NEWLINE') {
              comment_token.post_fix = false;
              
            } else {
              comment_token.post_fix = true;
              
            }
            if (value.match(/\n/)) {
              comment_token.multiline = true;
              
            } else {
              comment_token.multiline = false;
              
            }
            this.comments.push(comment_token);
            
          } else {
            this.tokens.push({ text: text, line: this.line, value: value, type: type });
            
          }
          index += text.length;
          
          this.line += ((text.match(/\n/g) != null) ? text.match(/\n/g).length : void 0) || 0;
          
          last_token_type = type; /*add a trailing newline in case the user didn't*/
          
      }
      this.tokens.push({ text: '\n', line: this.line, value: '', type: 'NEWLINE' });
      
      this.handleIndentation('NEWLINE', '');
  /*clear up any remaining indents at the end of the file
   * remove the newline if it wasn't needed*/
      
      (this.tokens[this.tokens.length - 1].type === 'NEWLINE') ? this.tokens.pop() : void 0;
      
    };
    Lexer.prototype.handleIndentation = function (type, text) {
      var indentation;
      indentation = (type === 'WHITESPACE') ? text.length : 0;
      
      if (indentation > this.indent) {
        this.indents.push(this.indent);
        
        this.indent = indentation;
        
        this.tokens.push({ text: text, line: this.line, value: '', type: 'INDENT' });
        
      } else     if (indentation < this.indent) {
        while (this.indents.length > 0 && indentation < this.indent) {
            this.indent = this.indents.pop();
            
            (indentation > this.indent) ? this.error('indentation is misaligned on line ' + this.line) : void 0;
            
            this.tokens.push({ text: text, line: this.line, value: '', type: 'DEDENT' });
            
        }
        (indentation !== this.indent) ? this.error('indentation is misaligned') : void 0;
        
      }
    };
    Lexer.prototype.error = function (message) {
        throw message;
      
    };
  exports.Lexer = Lexer;
  parse_token = {  };
  parse_token.NUMBER = function  (text) {
    return Number(text);
    
  };
  parse_token.STRING = function  (text) {
    return text;
    
  };
  parse_token.IDENTIFIER = function  (text) {
    return text;
    
  };
  parse_token.NEWLINE = function  (text) {
    return '';
    
  };
  parse_token.WHITESPACE = function  (text) {
    return ' ';
    
  };
  parse_token.COMMENT = function  (text) {
    var rv;
    rv = text.trim();
    
    rv = (rv[1] === '#') ? rv.slice(3, -3) : rv.slice(1);
    
    rv = rv.replace(/^\s+/, "");
    
    rv = rv.replace(/\n[\f\r\t\v\u00A0\u2028\u2029 ]*#*[\f\r\t\v\u00A0\u2028\u2029 ]*/g, '\n * ');
    
    return rv.replace(/(\/\*)|(\*\/)/g, '**');
    
  };
  parse_token.LITERAL = function  (text) {
    return text.replace(/[\f\r\t\v\u00A0\u2028\u2029 ]/, '');
    
  };
  parse_token.REGEX = function  (text) {
    return text;
    
  };
  token_types = [[/^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*#(?!##[^#]).*)+/, 'COMMENT'], [/^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/, 'REGEX'], [/^0x[a-f0-9]+/i, 'NUMBER'], [/^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i, 'NUMBER'], [/^'(?:[^'\\]|\\.)*'/, 'STRING'], [/^"(?:[^"\\]|\\.)*"/, 'STRING'], [/^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/, 'IDENTIFIER'], [/^\n([\f\r\t\v\u00A0\u2028\u2029 ]*\n)*\r*/, 'NEWLINE'], [/^[\f\r\t\v\u00A0\u2028\u2029 ]+/, 'WHITESPACE'], [/^[\<\>\!\=]\=/, 'LITERAL'], [/^[\+\-\*\/\^\=\.><\(\)\[\]\,\.\{\}\:\?]/, 'LITERAL']];
})()
