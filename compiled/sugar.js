(function () {
  var grammar, KEYWORDS, NOPAREN_WORDS;
  var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  grammar = require('./grammar');
  KEYWORDS = grammar.KEYWORDS;
  NOPAREN_WORDS = ['is', 'otherwise', 'except', 'else', 'doesnt', 'exist', 'exists', 'isnt', 'inherits', 'from', 'and', 'or', 'xor', 'in', 'when', 'instanceof', 'of', 'nor', 'if', 'unless', 'except'];
  exports.translate_sugar = function translate_sugar (tokens, show_tokens) {
    var out_tokens, debug, ki$1, kobj$1, t;
    out_tokens = coffee_style_functions(noparen_function_calls(multiline_statements(clean(tokens))));
    
    if (show_tokens) {
      debug = [];
      
      kobj$1 = out_tokens;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        t = kobj$1[ki$1];
          debug.push(t.value || t.type);
          
      }
      console.log(debug.join(' '));
      
    }
    return out_tokens;
    
    
  };
  /*  # close out with a newline in case the user did not, remove whitespace*/
  function clean (tokens) {
    var out_tokens, ki$1, kobj$1, token;
    out_tokens = [];
    
    kobj$1 = tokens;
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      token = kobj$1[ki$1];
        (token.type !== 'WHITESPACE') ? out_tokens.push(token) : void 0;
        
    }
    return out_tokens;
    
  };
  /*  # allow multi-line statements with line breaks after commas, colons, and equal signs*/
  function multiline_statements (tokens) {
    var out_tokens, last_token, continue_line, reduce_dedent, ki$1, kobj$1, token, skip_token;
    out_tokens = [];
    
    last_token = null;
    
    continue_line = false;
    
    reduce_dedent = 0;
    
    
    kobj$1 = tokens;
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      token = kobj$1[ki$1];
        skip_token = false;
        
        if (($kindexof.call([',', '=', ':'], ((last_token != null) ? last_token.value : void 0)) >= 0)  && token.type === 'NEWLINE') {
          continue_line = true;
          
          skip_token = true;
          
        } else       if (continue_line) {
          if (token.type === 'INDENT') {
            skip_token = true;
            
            reduce_dedent += 1;
            
          } else         if (token.type === 'NEWLINE') {
            skip_token = true;
            
          } else         if (token.type === 'DEDENT') {
            if (reduce_dedent > 0) {
              reduce_dedent -= 1;
              
              skip_token = true;
              
              if (reduce_dedent === 0) {
                out_tokens.push({ text: '\n', line: token.line, value: '', type: 'NEWLINE' });
                
              }
            } else {
              /*dd back in the newli*/
              out_tokens.push(last_token);
              
            }
          }
        }
        (!(skip_token)) ? out_tokens.push(token) : void 0;
        
        last_token = token;
        
    }
    return out_tokens;
    
    
  };
  /*  # allow function calls without parentheses*/
  function noparen_function_calls (tokens) {
    var out_tokens, close_paren_count, last_token, triggers, closures, ignore_next_indent, i, token, last_token_callable, this_token_not_operator, closure;
    out_tokens = [];
    
    close_paren_count = 0;
    
    last_token = null;
    
    triggers = [];
    
    closures = [];
    
    ignore_next_indent = false;
    
    
    i = 0;
    
    while (i < tokens.length) {
        token = tokens[i];
        
        last_token_callable = (((last_token != null) ? last_token.type : void 0) === 'IDENTIFIER' && !((($kindexof.call(KEYWORDS, last_token.value) >= 0) ))) || ((last_token != null) ? last_token.value : void 0) === ']';
        
        this_token_not_operator = ((($kindexof.call(['IDENTIFIER', 'NUMBER', 'STRING', 'REGEX'], token.type) >= 0)  || token.value === '{') && !((($kindexof.call(NOPAREN_WORDS, token.value) >= 0) )));
        
        if (last_token_callable && this_token_not_operator) {
          triggers.push('NEWLINE');
          
          out_tokens.push({ text: '(', line: token.line, value: '(', type: 'LITERAL' });
          
          closures.push(')');
          
        } else       if (token.type === 'NEWLINE' && triggers[triggers.length - 1] === 'NEWLINE' && ((tokens[i + 1] != null) ? tokens[i + 1].type : void 0) === 'INDENT') {
          triggers[triggers.length - 1] = 'DEDENT';
          
          ignore_next_indent = true;
          
        } else       if (token.type === 'INDENT') {
          if (ignore_next_indent) {
            ignore_next_indent = false;
            
          } else {
            triggers.push('DEDENT');
            
            closures.push('');
            
          }
        }
        
        if ((token.type === 'NEWLINE' || ($kindexof.call(['if', 'unless', 'when', 'except'], token.value) >= 0) ) && closures.length > 0 && triggers[triggers.length - 1] === 'NEWLINE') {
          while (closures.length > 0 && triggers[triggers.length - 1] === 'NEWLINE') {
              triggers.pop();
              
              closure = closures.pop();
              
              (closure !== '') ? out_tokens.push({ text: closure, line: token.line, value: closure, type: 'LITERAL' }) : void 0;
              
          }
          out_tokens.push(token);
          
        } else       if (token.type === 'DEDENT' && closures.length > 0 && triggers[triggers.length - 1] === 'DEDENT') {
          out_tokens.push(token);
          
          triggers.pop();
          
          closure = closures.pop();
          
          (closure !== '') ? out_tokens.push({ text: closure, line: token.line, value: closure, type: 'LITERAL' }) : void 0;
          
        } else       if (closures.length === 0 || token.type !== triggers[triggers.length - 1]) {
          out_tokens.push(token);
          
        }
        last_token = token;
        
        i += 1;
        
    }
    return out_tokens;
    
  };
  /*  #allow function definitions with the -> operator*/
  function coffee_style_functions (tokens) {
    var out_tokens, last_token, i, token, new_tokens, t, f_token;
    out_tokens = [];
    
    last_token = null;
    
    
    i = 0;
    
    while (i < tokens.length) {
        token = tokens[i];
        
        if (((last_token != null) ? last_token.value : void 0) === '-' && ((token != null) ? token.value : void 0) === '>') {
          /*remove the da*/
          out_tokens.pop();
          
          new_tokens = [];
          
          t = out_tokens.pop();
          
          if (((t != null) ? t.value : void 0) === ')') {
            while (((t != null) ? t.value : void 0) !== '(') {
                new_tokens.unshift(t);
                
                t = out_tokens.pop();
                
            }
            new_tokens.unshift(t);
            
          } else {
            out_tokens.push(t);
            
            new_tokens.push({ text: '(', line: token.line, value: '(', type: 'LITERAL' });
            
            new_tokens.push({ text: ')', line: token.line, value: ')', type: 'LITERAL' });
            
          }
          f_token = { text: 'function', line: token.line, value: 'function', type: 'IDENTIFIER' };
          
          new_tokens.unshift(f_token);
          
          out_tokens = out_tokens.concat(new_tokens);
          
        } else {
          /*      # push the current token unchanged*/
          out_tokens.push(token);
          
        }
        last_token = token;
        
        i += 1;
        
    }
    return out_tokens;
    
  };
})()
