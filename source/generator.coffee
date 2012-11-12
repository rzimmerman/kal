exports.load = (grammar) ->
  apply_generator_to_grammar.apply grammar
  
apply_generator_to_grammar = ->
  i = ''
  indent = -> i += '  '
  dedent = -> i = i[0..-3]
  
  
  @File::js = ->
    i = ''
    (statement.js() for statement in @statements).join '\n'
    
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
    rv = "if (#{@conditional.js()}) {\n#{@true_block.js()}\n}"
    rv += @else_block.js() if @else_block?
    return rv
    
  @ElseStatement::js = ->
    if @false_block instanceof @IfStatement
      return "else #{@false_block.js()}"
    else
      return "else {\n#{@false_block.js()}\n}\n"

  @BlankStatment::js = ->
    return ''
    
  @Block::js = ->
    indent()
    rv = (statement.js() for statement in @statements).join '\n'
    dedent()
    return rv
  
  @ParenExpression::js = ->
    return "(#{@expr.js()})"
  