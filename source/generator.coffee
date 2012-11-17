
KEYWORD_TRANSLATE = 
  'yes':'true'
  'on':'true'
  'no':'false'
  'off':'false'
  'is':'==='
  'isnt':'!=='
  '==':'==='
  '!=':'!=='
  'and':'&&'
  'or':'||'
  'xor':'^'
  'not':'!'

exports.load = (grammar) ->
  apply_generator_to_grammar.apply grammar  

apply_generator_to_grammar = ->
  i = ''
  indent = -> i += '  '
  dedent = -> i = i[0..-3]
  
  scopes = []
  scope = {}
  
  use_snippets = {}
  
  push_scope = ->
    scopes.push scope
    new_scope = {}
    for k,v of scope
      if v is 'no closures'
        #do nothing
      else if v is 'closures ok' or v is 'argument' or v is 'function'
        new_scope[k] = 'closure'
      else if v is 'closure'
        new_scope[k] = 'closure'
    scope = new_scope
      
  pop_scope = (code, force_closed, wrap) ->
    rv = i
    var_names = (var_name for var_name, type of scope when type not in ['closure', 'argument', 'function'])
    if var_names.length > 0 or wrap
      if wrap
        rv += '(function () {\n'
        indent()
        code = i + code.replace /\n/g, '\n  '
      rv += '  var ' + var_names.join(', ') + ';\n' if var_names.length > 0
    rv += code
    if var_names.length > 0 or wrap
      dedent()
      rv += "\n#{i}})()\n" if wrap
    scope = scopes.pop() if scopes isnt []
    return rv
  
  self = this
  
  @File::js = ->
    i = ''
    scope = {}
    scopes = []
    use_snippets = {}
    code = (statement.js() for statement in @statements).join '\n'
    snip = (snippet for key, snippet of use_snippets).join('\n')
    rv = [snip, code].join '\n' 
    return pop_scope rv, yes, yes
    
  @Statement::js = ->
    return i + @statement.js()
    
  @ReturnStatement::js = ->
    return "return #{@expr.js()};"
    
  @ExpressionStatement::js = ->
    return "#{@expr.js()};"
    
  @Expression::js = ->
    return "#{@left.js()}" unless @op?
    opjs = @op.js()
    if opjs is 'in'
      unless use_snippets['in']?
        use_snippets['in'] = snippets['in']
        subscope['$kindexof'] = 'closure' for subscope in scopes
        scope['$kindexof'] = 'closure'
      return "$kindexof.call(#{@right.js()}, #{@left.js()}) >= 0"
    else
      return "#{@left.js()} #{opjs} #{@right.js()}"
    
  @UnaryExpression::js = ->
    rv = ''
    rv += KEYWORD_TRANSLATE[@preop.value] if @preop?.value?
    if @base.type is 'IDENTIFIER'
      rv += KEYWORD_TRANSLATE[@base.value] or @base.value
      scope[@base.value] = 'closures ok' unless scope[@base.value]? or not @is_lvalue()
    else
      rv += @base.js()
    rv += accessor.js() for accessor in @accessors
    return rv
  
  @PropertyAccess::js = ->
    if @expr.type is 'IDENTIFIER'
      rv = @expr.value
    else
      rv = @expr.js()
    return ".#{rv}"
  
  @AssignmentStatement::js = ->
    return "#{@lvalue.js()} #{@assignOp.value} #{@rvalue.js()};"
    
  @NumberConstant::js = ->
    return "#{@token.text}"
  
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
    return KEYWORD_TRANSLATE[@op.value] or @op.value;
    
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
    if @name?
      rv += @name.value
      scope[@name.value] = 'function'
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
    
  snippets =
    'in': 'var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };'
    