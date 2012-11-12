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
    scope = {}
  pop_scope = (code, force_closed) ->
    rv = i
    var_names = (var_name for var_name, bubbles of scope when not bubbles or force_closed or scopes is [])
    if var_names.length > 0
      rv += '(function () {\n'
      indent()
      rv += i + 'var ' + var_names.join(', ') + ';\n'
    rv += '  ' + code.replace /\n/g, '\n  '
    if var_names.length > 0
      dedent()
      rv += "\n#{i}})()\n"
    scope = scopes.pop() if scopes isnt []
    return rv
  
  self = this
  
  @File::js = ->
    i = ''
    scope = {}
    scopes = []
    rv = (statement.js() for statement in @statements).join '\n'
    return pop_scope rv, yes
    
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
      scope[@base.value] = yes
    else
      rv = @base.js()
    rv += @indexer.js() if @indexer?
    return rv
    
  @AssignmentStatement::js = ->
    return "#{@lvalue.js()} #{@assignOp.value} #{@rvalue.js()};"
    
  @NumberConstant::js = ->
    return "#{@token.value}"
  
  @StringConstant::js = ->
    return "'#{@token.value}'"
  
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

  @BlankStatment::js = ->
    return ''

  for_depth = 1
  @ForStatement::js = ->
    iterator   = "ki$#{for_depth}"
    terminator = "kobj$#{for_depth}"
    scope[iterator] = yes
    scope[terminator] = yes
    rv = "#{terminator} = #{@iterable.js()};\n#{i}for (#{iterator} = 0; #{iterator} < #{terminator}.length; #{iterator}++) {\n"
    indent()
    for_depth += 1
    rv += "#{i}#{@iterant.js()} = #{iterator};\n"
    rv += @loop_block.js()
    for_depth -= 1
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
  