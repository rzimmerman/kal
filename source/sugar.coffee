{KEYWORDS} = require './grammar'

exports.translate_sugar = (tokens) ->
  out_tokens = noparen_function_calls multiline_statements clean tokens
  return out_tokens
  
clean = (tokens) ->
  # close out with a newline in case the user did not, remove whitespace
  out_tokens = (token for token in tokens when token.type isnt 'WHITESPACE')
  out_tokens.push text:'\n', line:last_token?.line, value:'', type:'NEWLINE'
  return out_tokens

multiline_statements = (tokens) ->  
  # allow multi-line statements with line breaks after commas, colons, and equal signs
  out_tokens = []
  last_token = null
  continue_line = no
  reduce_dedent = 0
  
  for token in tokens
    skip_token = no
    if last_token?.value in [',','=',':'] and token.type is 'NEWLINE'
      continue_line = yes
      skip_token = yes
    else if continue_line
      if token.type is 'INDENT'
        skip_token = yes
        reduce_dedent += 1
      else if token.type is 'NEWLINE'
        skip_token = yes
      else if token.type is 'DEDENT'
        if reduce_dedent > 0
          reduce_dedent -= 1
          skip_token = yes
          if reduce_dedent is 0
            out_tokens.push text:'\n', line:token.line, value:'',type:'NEWLINE'
        else
          out_tokens.push last_token #add back in the newline
    out_tokens.push token unless skip_token
    last_token = token
  return out_tokens
  
noparen_function_calls = (tokens) ->
  # allow function calls without parentheses
  out_tokens = []
  close_paren_count = 0
  last_token = null
  
  i = 0
  while i < tokens.length
    token = tokens[i]
    if last_token?.type is 'IDENTIFIER' and last_token.value not in KEYWORDS and token.type in ['IDENTIFIER','NUMBER','STRING'] and token.value not in ['otherwise','except','else','exists']
      close_paren_count += 1
      out_tokens.push text:'(', line:token.line, value:'(', type:'LITERAL'
    else if close_paren_count > 0 and token.type is 'NEWLINE'
      while close_paren_count > 0
        close_paren_count -= 1
        out_tokens.push text:')', line:token.line, value:')', type:'LITERAL'
    
    # push the current token unchanged
    out_tokens.push token
    last_token = token
    i += 1
  return out_tokens