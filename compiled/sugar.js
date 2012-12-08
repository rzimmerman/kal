(function () {
  var grammar, KEYWORDS, NOPAREN_WORDS;
  var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  grammar = require('./grammar');
  KEYWORDS = grammar.KEYWORDS;
  NOPAREN_WORDS = ['is', 'otherwise', 'except', 'else', 'doesnt', 'exist', 'exists', 'isnt', 'inherits', 'from', 'and', 'or', 'xor', 'in', 'when', 'instanceof', 'of', 'nor', 'if', 'unless', 'except', 'for', 'with'];
  function translate_sugar (tokens, options, tokenizer) {
    var out_tokens, debug, ki$1, kobj$1, t;
    out_tokens = coffee_style_functions(noparen_function_calls(multiline_statements(multiline_lists(clean(code_in_strings(tokens, tokenizer))))));
    
    if (((options != null) ? options.show_tokens : void 0)) {
      debug = [];
      
      kobj$1 = out_tokens;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        t = kobj$1[ki$1];
          if (t.type === 'NEWLINE') {
            debug.push('\n');
            
          } else {
            debug.push(t.value || t.type);
            
          }
      }
      console.log(debug.join(' '));
      
    }
    return out_tokens;
    
  };
  exports.translate_sugar = translate_sugar;
  function clean (tokens) { /*close out with a newline in case the user did not, remove whitespace*/
    var out_tokens, ki$1, kobj$1, token;
    out_tokens = [];
    
    kobj$1 = tokens;
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      token = kobj$1[ki$1];
        if (token.type !== 'WHITESPACE') {
          out_tokens.push(token);
          
        } else       if (out_tokens.length > 0) {
          out_tokens[out_tokens.length - 1].trailed_by_white = true;
          
        }
    }
    return out_tokens;
    
  };
  function multiline_statements (tokens) { /*allow multi-line statements with line breaks after commas, colons, and equal signs*/
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
              out_tokens.push(last_token); /*add back in the newline*/
              
            }
          }
        }
        (!(skip_token)) ? out_tokens.push(token) : void 0;
        
        last_token = token;
        
    }
    return out_tokens;
    
  };
  function noparen_function_calls (tokens) { /*allow function calls without parentheses*/
    var out_tokens, close_paren_count, last_token, triggers, closures, ignore_next_indent, i, token, last_token_isnt_reserved, last_token_callable, token_isnt_reserved, this_token_not_operator, closure;
    out_tokens = [];
    
    close_paren_count = 0;
    
    last_token = null;
    
    triggers = [];
    
    closures = [];
    
    ignore_next_indent = false;
    
    i = 0;
    
    while (i < tokens.length) {
        token = tokens[i];
        
        last_token_isnt_reserved = !((($kindexof.call(KEYWORDS, ((last_token != null) ? last_token.value : void 0)) >= 0) )) || ((tokens[i - 2] != null) ? tokens[i - 2].value : void 0) === '.';
        
        last_token_callable = (((last_token != null) ? last_token.type : void 0) === 'IDENTIFIER' && last_token_isnt_reserved) || ((last_token != null) ? last_token.value : void 0) === ']';
        
        token_isnt_reserved = !((($kindexof.call(NOPAREN_WORDS, token.value) >= 0) ));
        
        this_token_not_operator = ((($kindexof.call(['IDENTIFIER', 'NUMBER', 'STRING', 'REGEX'], token.type) >= 0)  || token.value === '{' || (token.value === '[' && ((last_token != null) ? last_token.trailed_by_white : void 0))) && token_isnt_reserved);
        
        if (last_token_callable && this_token_not_operator) {
          triggers.push('NEWLINE');
          
          out_tokens.push({ text: '(', line: token.line, value: '(', type: 'LITERAL' });
          
          closures.push(')');
          
        } else       if ((token.value === 'function' || (token.value === '>' && ((last_token != null) ? last_token.value : void 0) === '-')) && triggers[triggers.length - 1] === 'NEWLINE') {
          triggers[triggers.length - 1] = 'DEDENT';
          
          ignore_next_indent = true;
          
        } else       if (token.type === 'INDENT') {
          if (ignore_next_indent) {
            ignore_next_indent = false;
            
          } else {
            triggers.push('DEDENT');
            
            closures.push('');
            
          }
        } else       if (token.type === 'NEWLINE' && ((tokens[i + 1] != null) ? tokens[i + 1].type : void 0) !== 'INDENT') {
          ignore_next_indent = false;
          
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
  function coffee_style_functions (tokens) { /*allow function definitions with the -> operator*/
    var out_tokens, last_token, i, token, new_tokens, t, f_token;
    out_tokens = [];
    
    last_token = null;
    
    i = 0;
    
    while (i < tokens.length) {
        token = tokens[i];
        
        if (((last_token != null) ? last_token.value : void 0) === '-' && ((token != null) ? token.value : void 0) === '>') {
          out_tokens.pop(); /*remove the dash*/
          
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
          out_tokens.push(token); /*push the current token unchanged*/
          
        }
        last_token = token;
        
        i += 1;
        
    }
    return out_tokens;
    
  };
  function code_in_strings (tokens, tokenizer) { /*allow double-quoted strings with embedded code, like: "x is #{x}"*/
    var out_tokens, ki$1, kobj$1, token, rv, r, m, add_parens, new_token_text, new_tokens;
    if ((tokenizer == null)) {
    return tokens;
    }
    
    out_tokens = [];
    
    kobj$1 = tokens;
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      token = kobj$1[ki$1];
        if (token.type === 'STRING' && token.value[0] === '"') {
          rv = token.value;
          
          r = /#{.*?}/g;
          
          m = r.exec(rv);
          
          add_parens = (m) ? true : false;
          
          (add_parens) ? out_tokens.push({ text: '(', line: token.line, value: '(', type: 'LITERAL' }) : void 0;
          
          while (m) {
              new_token_text = rv.slice(0, m.index) + '"';
              
              out_tokens.push({ text: new_token_text, line: token.line, value: new_token_text, type: 'STRING' });
              
              out_tokens.push({ text: '+', line: token.line, value: '+', type: 'LITERAL' });
              
              new_tokens = tokenizer(rv.slice(m.index + 2, m.index + m[0].length - 1))[0];
              
              (new_tokens.length !== 1) ? out_tokens.push({ text: '(', line: token.line, value: '(', type: 'LITERAL' }) : void 0;
              
              out_tokens = out_tokens.concat(new_tokens);
              
              (new_tokens.length !== 1) ? out_tokens.push({ text: ')', line: token.line, value: ')', type: 'LITERAL' }) : void 0;
              
              rv = '"' + rv.slice(m.index + m[0].length);
              
              if (rv === '""') { /*avoid adding a (+ "") to strings that end with #{expr}"*/
                rv = '';
                
              } else {
                out_tokens.push({ text: '+', line: token.line, value: '+', type: 'LITERAL' });
                
              }
              r = /#{.*?}/g;
              
              m = r.exec(rv);
              
          }
          (rv !== '') ? out_tokens.push({ text: rv, line: token.line, value: rv, type: 'STRING' }) : void 0;
          
          (add_parens) ? out_tokens.push({ text: ')', line: token.line, value: ')', type: 'LITERAL' }) : void 0;
          
        } else {
          out_tokens.push(token);
          
        }
    }
    return out_tokens;
    
  };
  function multiline_lists (tokens) { /*allow lists to span multiple lines*/
    var out_tokens, list_depth, last_token_was_white, indent_depths, indent_depth, leftover_indent, ki$1, kobj$1, token, skip_this_token, token_is_white;
    out_tokens = [];
    
    list_depth = 0;
    
    last_token_was_white = false;
    
    indent_depths = [];
    
    indent_depth = 0;
    
    leftover_indent = 0;
    
    kobj$1 = tokens;
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      token = kobj$1[ki$1];
        skip_this_token = false;
        
        token_is_white = (($kindexof.call(['NEWLINE', 'INDENT', 'DEDENT'], token.type) >= 0)  || token.value === ',');
        
        if (token.value === '[') {
          list_depth += 1;
          
          indent_depths.push(indent_depth);
          
          indent_depth = 0;
          
        } else       if (token.value === ']') {
          list_depth -= 1;
          
          leftover_indent = indent_depth;
          
          indent_depth = indent_depths.pop();
          
        } else       if (token.type === 'INDENT') {
          indent_depth += 1;
          
          if (leftover_indent !== 0) {
            leftover_indent += 1;
            
            skip_this_token = true;
            
            (leftover_indent === 0) ? out_tokens.push({ text: '', line: token.line, value: '\n', type: 'NEWLINE' }) : void 0;
            
          }
        } else       if (token.type === 'DEDENT') {
          indent_depth -= 1;
          
          if (leftover_indent !== 0) {
            leftover_indent -= 1;
            
            (leftover_indent === 0) ? out_tokens.push({ text: '', line: token.line, value: '\n', type: 'NEWLINE' }) : void 0;
            
            skip_this_token = true;
            
          }
        } else       if (token.type === 'NEWLINE') {
          if (leftover_indent !== 0) {
            skip_this_token = true;
            
          }
        } else {
          leftover_indent = 0;
          
        }
        if (list_depth > 0) {
          if (token_is_white && !(last_token_was_white)) { /*the first token in a newline stretch gets turned into a comma*/
            out_tokens.push({ text: ',', line: token.line, value: ',', type: 'LITERAL' });
            
          } else {
            (!(token_is_white || skip_this_token)) ? out_tokens.push(token) : void 0;
            
          }
        } else {
          (!(skip_this_token)) ? out_tokens.push(token) : void 0;
          
        }
        last_token_was_white = token_is_white && (list_depth > 0);
        
    }
    return out_tokens;
    
    
  };
})()
