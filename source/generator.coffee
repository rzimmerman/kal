exports.load = (grammar) ->
  apply_generator_to_grammar.apply grammar
  
apply_generator_to_grammar = ->
  i = ''
  indent = -> i += '  '
  dedent = -> i = i[0..-3]
  
  scopes = []
  scope = {}
  push_scope = ->
    scopes.push scope
    new_scope = {}
    for k,v of scope
      if v is 'no closures'
        #do nothing
      else if v is 'closures ok' or v is 'argument'
        new_scope[k] = 'closure'
      else if v is 'closure'
        new_scope[k] = 'closure'
    scope = new_scope
      
  pop_scope = (code, force_closed, wrap) ->
    rv = i
    var_names = (var_name for var_name, type of scope when type isnt 'closure' and type isnt 'argument')
    if var_names.length > 0
      if wrap
        rv += '(function () {\n'
        indent()
        code = i + code.replace /\n/g, '\n  '
      rv += '  var ' + var_names.join(', ') + ';\n'
    rv += code
    if var_names.length > 0
      dedent()
      rv += "\n#{i}})()\n" if wrap
    scope = scopes.pop() if scopes isnt []
    return rv
  
  self = this
  
  string_escape = (str) ->
    
  
  @File::js = ->
    i = ''
    scope = {}
    scopes = []
    rv = (statement.js() for statement in @statements).join '\n'
    return pop_scope rv, yes, yes
    
  @Statement::js = ->
    return i + @statement.js()
    
  @ReturnStatement::js = ->
    return "return #{@expr.js()};"
    
  @ExpressionStatement::js = ->
    return "#{@expr.js()};"
    
  @Expression::js = ->
    return "#{@left.js()}" unless @op?
    return "#{@left.js()} #{@op.js()} #{@right.js()}"
    
  @UnaryExpression::js = ->
    if @base.type is 'IDENTIFIER'
      rv = @base.value
      scope[@base.value] = 'closures ok' unless scope[@base.value]?
    else
      rv = @base.js()
    rv += accessor.js() for accessor in @accessors
    return rv
    
  @AssignmentStatement::js = ->
    return "#{@lvalue.js()} #{@assignOp.value} #{@rvalue.js()};"
    
  @NumberConstant::js = ->
    return "#{@token.value}"
  
  @StringConstant::js = ->
    rv = @token.value
    if @token.value[0] is '"'
      r = /#{.*?}/g
      m = r.exec rv
      while m
        rv = rv[0...m.index] + '" + ' + rv[m.index+2...m.index+m[0].length-1] + ' + "' + rv[m.index+m[0].length..]
        m = r.exec rv
    return rv
  
  @BinOp::js = ->
    return @op.value;
    
  @IfStatement::js = ->
    rv = "if (#{@conditional.js()}) {\n#{@true_block.js()}\n#{i}}"
    rv += @else_block.js() if @else_block?
    return rv
    
  @ElseStatement::js = ->
    if @false_block instanceof self.Statement and @false_block.statement instanceof self.IfStatement
      return " else #{@false_block.js()}"
    else
      return " else {\n#{@false_block.js()}\n#{i}}"

  @BlankStatement::js = ->
    return ''

  for_depth = 1
  @ForStatement::js = ->
    iterator   = "ki$#{for_depth}"
    terminator = "kobj$#{for_depth}"
    scope[iterator] = 'no closures'
    scope[terminator] = 'no closures'
    rv = "#{terminator} = #{@iterable.js()};\n#{i}for (#{iterator} = 0; #{iterator} < #{terminator}.length; #{iterator}++) {\n"
    indent()
    for_depth += 1
    rv += "#{i}#{@iterant.js()} = #{iterator};\n"
    rv += @loop_block.js()
    for_depth -= 1
    dedent()
    rv += "\n#{i}}"
    return rv
    
  @WhileStatement::js = ->
    rv = "while (#{@expr.js()}) {\n"
    indent()
    rv += @block.js()
    dedent()
    rv += "\n#{i}}"
    return rv
    
  @Block::js = ->
    indent()
    rv = (statement.js() for statement in @statements).join '\n'
    dedent()
    return rv
  
  @ParenExpression::js = ->
    return "(#{@expr.js()})"
    
  @IndexExpression::js = ->
    return "[#{@expr.js()}]"
  
  @ListExpression::js = ->
    rv = (item.js() for item in @items).join(', ')
    return "[#{rv}]"
    
  @MapItem::js = ->
    return "#{@key.js()}: #{@val.js()}"
    
  @MapExpression::js = ->
    rv = (item.js() for item in @items).join(', ')
    return "{ #{rv} }"

  @FunctionExpression::js = ->
    rv = "function "
    rv += @name.value if @name?
    arg_names = (argument.name.value for argument in @arguments)
    rv += "(#{arg_names.join(', ')}) {\n"
    push_scope()
    scope[arg_name] = 'argument' for arg_name in arg_names
    block_code = @block.js()
    block_code = pop_scope block_code, no, no
    rv += "#{block_code}\n#{i}}"
    
  @FunctionCall::js = ->
    rv = (argument.js() for argument in @arguments).join ', '
    return "(#{rv})"
    
  @FunctionCallArgument::js = ->
    return @val.js()