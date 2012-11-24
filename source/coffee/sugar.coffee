{KEYWORDS} = require './grammar'

NOPAREN_WORDS = ['is','otherwise','except','else','doesnt','exist','exists','isnt','inherits','from','and','or',
                 'xor','in','when','instanceof','of']

exports.translate_sugar = (tokens) ->
  out_tokens = coffee_style_functions noparen_function_calls multiline_statements clean tokens
  #console.log (t.value or t.type for t in out_tokens).join ' '
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
  triggers = []
  closures = []
  ignore_next_indent = no
  
  i = 0
  while i < tokens.length
    token = tokens[i]
    if last_token?.type is 'IDENTIFIER' and last_token.value not in KEYWORDS and token.type in ['IDENTIFIER','NUMBER','STRING'] and token.value not in NOPAREN_WORDS
      triggers.push 'NEWLINE'
      out_tokens.push text:'(', line:token.line, value:'(', type:'LITERAL'
      closures.push ')'
    else if token.type is 'NEWLINE' and triggers[triggers.length-1] is 'NEWLINE' and tokens[i+1]?.type is 'INDENT'
      triggers[triggers.length-1] = 'DEDENT'
      ignore_next_indent = yes
    else if token.type is 'INDENT'
      if ignore_next_indent
        ignore_next_indent = no
      else
        triggers.push 'DEDENT'
        closures.push ''
    
    if closures.length > 0 and token.type is triggers[triggers.length - 1]
      triggers.pop()
      closure = closures.pop()
      out_tokens.push token if token.type is 'DEDENT'
      out_tokens.push text:closure, line:token.line, value:closure, type:'LITERAL' if closure isnt ''
      out_tokens.push token if token.type isnt 'DEDENT'
    else
      out_tokens.push token
    last_token = token
    i += 1
  return out_tokens

coffee_style_functions = (tokens) ->
  #allow function definitions with the -> operator
  out_tokens = []
  last_token = null
  
  i = 0
  while i < tokens.length
    token = tokens[i]
    if last_token?.value is '-' and token?.value is '>'
      out_tokens.pop() # remove the dash
      new_tokens = []
      t = out_tokens.pop()
      if t?.value is ')'
        while t?.value isnt '('
          new_tokens.unshift t
          t = out_tokens.pop()
        new_tokens.unshift t
      else
        out_tokens.push t
        new_tokens.push text:'(', line:token.line, value:'(', type:'LITERAL'
        new_tokens.push text:')', line:token.line, value:')', type:'LITERAL'
      f_token = {text:'function', line:token.line, value:'function', type:'IDENTIFIER'}
      new_tokens.unshift f_token
      out_tokens = out_tokens.concat new_tokens
    else
      # push the current token unchanged
      out_tokens.push token
    last_token = token
    i += 1
  return out_tokens