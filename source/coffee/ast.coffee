class ParseFailed extends Error
  constructor: (@message) -> super
    
exports.SyntaxError = class SyntaxError extends ParseFailed

exports.ASTBase = class ASTBase
  constructor: (ts) ->
    @locked = no
    @ts = ts
    @line = ts.line
    @parse()
    
  #optionally match one of the classes or tokens in the list
  opt: -> 
    rv = null
    start_index = @ts.index
    for cls in arguments
      if typeof cls is 'string'
        if @ts.type is cls
          rv = @ts.current
          @ts.next()
          return rv
      else
        try
          rv = new cls @ts
          return rv
        catch e
          @ts.goto_token start_index
          throw e if e instanceof SyntaxError
    return null
  
  #require match to one of the classes or tokens in the list
  req: -> 
    rv = @opt.apply this, arguments
    return rv if rv?
    
    list = (cls.name or cls for cls in arguments)
    if list.length is 1
      message = "Expected #{list[0]}"
    else
      message = "Expected one of #{list.join(', ')}"
    @error "#{message}"
  
  opt_val: -> #require token value
    if @ts.value in arguments
      rv = @ts.current
      @ts.next()
      return rv
    else
      return null
      
  req_val: ->
    rv = @opt_val.apply this, arguments
    return rv if rv?
    @error "Expected #{(v for v in arguments).join(' or ')}"
  
  req_multi: -> #require at least one
    rv = @opt_multi.apply this, arguments
    return rv if rv.length > 0
    
    list = (cls.name or cls for cls in arguments)
    @error "Expected one of #{list.join(', ')}"
    
      
  opt_multi: -> #optionally have multiple
    cls = @opt.apply this, arguments
    return [] unless cls?
    rv = [cls]
    while cls?
      cls = @opt.apply this, arguments
      rv.push cls if cls?
    return rv
  
  parse: -> @error 'Parser Not Implemented: ' + @constructor.name
  js: -> @error 'Javascript Generator Not Implemented: ' + @constructor.name
  error: (msg) -> 
    full_msg = msg + ' on line ' + @line
    if @locked
      throw new SyntaxError full_msg
    else
      throw new ParseFailed full_msg
    
  lock: -> @locked = yes
  