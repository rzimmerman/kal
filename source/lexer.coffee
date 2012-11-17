exports.tokenize = (code) ->
  lex = new Lexer(code)
  return [lex.tokens, lex.comments]

exports.Lexer = class Lexer
  constructor: (code, line_number) ->
    @code = code
    @line = line_number or 1
    @indent = 0
    @indents = []
    @tokenize()
    
  tokenize: ->
    @tokens = []
    @comments = []
    last_token_type = null
    index = 0
    
    while index < @code.length
      chunk = @code[index..]
      for [regex,type] in token_types
        text = regex.exec(chunk)?[0]
        if text?
          @type = type
          break
      @error "invalid token '#{@code[index..index+15]}...'" unless text?
      value = parse_token[@type] text
      if last_token_type is 'NEWLINE' #check for indent/dedent
        @handleIndentation type, text
      if type is 'COMMENT'
        @comments.push text:text, line:@line, value:value, type:type
      else if type isnt 'WHITESPACE'
        @tokens.push text:text, line:@line, value:value, type:type
      index += text.length
      @line += /\n/.exec(text)?[0].length or 0
      last_token_type = type
    @handleIndentation 'NEWLINE', '' #clear up any remaining indents at the end of the file
      
  handleIndentation: (type, text) ->
    indentation = if type is 'WHITESPACE' then text.length else 0
    if indentation > @indent
      @indents.push @indent
      @indent = indentation
      @tokens.push text:text, line:@line, value:'', type:'INDENT'
    else if indentation < @indent
      while @indents.length > 0 and indentation < @indent
        @indent = @indents.pop()
        @error 'indentation is misaligned' if indentation > @indent
        @tokens.push text:text, line:@line, value:'', type:'DEDENT'
      @error 'indentation is misaligned' if indentation isnt @indent
      
  error: (message) ->
    throw message
    

parse_token = 
  NUMBER: (text) -> return Number(text)
  STRING: (text) -> return text
  IDENTIFIER: (text) -> return text
  NEWLINE: (text) -> return ''
  WHITESPACE: (text) -> return ' '
  COMMENT: (text) -> return (if text[1] is '#' then text[3..-4] else text[1..-1]).replace /(\/\*)|(\*\/)/g, '**'
  LITERAL: (text) -> return text.replace /[\f\r\t\v\u00A0\u2028\u2029 ]/, ''
  

token_types = [
  [/^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*#(?!##[^#]).*)+/, 'COMMENT'],
  [/^0x[a-f0-9]+/i, 'NUMBER'],
  [/^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i, 'NUMBER'],
  [/^'([^']*(\\'))*[^']*'/, 'STRING'],
  [/^"([^"]*(\\"))*[^"]*"/, 'STRING'],
  [/^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/, 'IDENTIFIER'],
  [/^(\r*\n\r*)+/, 'NEWLINE'],
  [/^[\f\r\t\v\u00A0\u2028\u2029 ]+/, 'WHITESPACE'],
  [/^[\+\-\*\/\^\=\.><\(\)\[\]\,\.\{\}\:]/, 'LITERAL']
]
  