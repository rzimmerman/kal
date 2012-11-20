(function () {
  var grammar, KEYWORDS, NOPAREN_WORDS, translate_sugar;
  var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  grammar = require('../source/coffee/grammar');
  KEYWORDS = grammar.KEYWORDS;
  NOPAREN_WORDS = ['is', 'otherwise', 'except', 'else', 'doesnt', 'exist', 'exists', 'isnt', 'inherits', 'from', 'and', 'or', 'xor', 'in', 'when', 'instanceof'];
  function translate_sugar (tokens) {
    var out_tokens;
    out_tokens = noparen_function_calls(multiline_statements(clean(tokens)));
    return out_tokens;
  };
  exports.translate_sugar = translate_sugar;
  /*
    # close out with a newline in case the user did not, remove whitespace*/function clean (tokens) {
    var out_tokens, ki$1, kobj$1, token, t, text, line, value, type;
    out_tokens = [];
    kobj$1 = (tokens);
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      token = kobj$1[ki$1];
        if (token.type !== 'WHITESPACE') {
    out_tokens.push(token)
        };
        
    }
    t = { text: '\n', line: typeof last_token !== 'undefined' && last_token !== null ? last_token.line : void 0, value: '', type: 'NEWLINE' };
    out_tokens.push(t);
    
    return out_tokens;
  };
  /*
    # allow multi-line statements with line breaks after commas, colons, and equal signs*/function multiline_statements (tokens) {
    var out_tokens, last_token, continue_line, reduce_dedent, ki$1, kobj$1, token, skip_token, t, text, line, value, type;
    out_tokens = [];
    last_token = null;
    continue_line = false;
    reduce_dedent = 0;
    
    kobj$1 = (tokens);
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      token = kobj$1[ki$1];
        skip_token = false;
        if (token.type === 'NEWLINE' && ($kindexof.call([',', '=', ':'], typeof last_token !== 'undefined' && last_token !== null ? last_token.value : void 0) >= 0)) {
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
                t = { text: '\n', line: token.line, value: '', type: 'NEWLINE' };
                out_tokens.push(t);
                
              }
            } else {
              /* #add back in the newline*/            out_tokens.push(last_token);
              
            }
          }
        }
        if (!(skip_token)) {
    out_tokens.push(token)
        };
        
        last_token = token;
    }
    return out_tokens;
    
  };
  /*
    # allow function calls without parentheses*/function noparen_function_calls (tokens) {
    var out_tokens, close_paren_count, last_token, i, token, last_ok, current_ok, current_valid, t, text, line, value, type;
    out_tokens = [];
    close_paren_count = 0;
    last_token = null;
    
    i = 0;
    while (i < tokens.length) {
        token = tokens[i];
        last_ok = ((typeof last_token !== 'undefined' && last_token !== null ? last_token.type : void 0) === 'IDENTIFIER' && !(($kindexof.call((KEYWORDS), last_token.value) >= 0)));
        current_ok = $kindexof.call(['IDENTIFIER', 'NUMBER', 'STRING'], token.type) >= 0;
        current_valid = !(($kindexof.call((NOPAREN_WORDS), token.value) >= 0));
        if (last_ok && current_ok && current_valid) {
          close_paren_count += 1;
          t = { text: '(', line: token.line, value: '(', type: 'LITERAL' };
          out_tokens.push(t);
          
        } else       if (close_paren_count > 0 && token.type === 'NEWLINE') {
          while (close_paren_count > 0) {
              close_paren_count -= 1;
              t = { text: ')', line: token.line, value: ')', type: 'LITERAL' };
              /*
      # push the current token unchanged*/            out_tokens.push(t);
              
          }
        }
        out_tokens.push(token);
        
        last_token = token;
        i += 1;
    }
    return out_tokens;
  };
})()
