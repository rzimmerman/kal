{GrammarRoot, Grammar} = require './grammar'

exports.Grammar = Grammar
exports.parse = (tokens) ->
  ts = new TokenStream(tokens)
  AST = new GrammarRoot(ts)
  return AST
  
class TokenStream
  constructor: (tokens) ->
    @tokens = tokens
    @goto_token 0
    
  next: ->
    return @goto_token @index+1
  
  prev: ->
    return @goto_token @index-1
  
  peek: (delta_index) ->
    @goto_token @index + delta_index
    token = @current
    @goto_token @index - delta_index
    return token
  
  goto_token: (index) ->
    @index = index
    if @index >= @tokens.length
      @current =
        type: 'EOF'
        text: ''
        line: 0
        value: ''
    else if @index < 0
      throw 'Parser Error: tried to read before beginning of file'
    else
      @current = @tokens[@index]
    @type = @current.type
    @text = @current.text
    @value = @current.value
    @line = @current.line
    return @current
    
