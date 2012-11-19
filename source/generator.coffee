
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
  'but':'&&'
  'or':'||'
  'xor':'^'
  'not':'!'
  'new':'new '
  'me':'this'

exports.load = (grammar) ->
  apply_generator_to_grammar.apply grammar

apply_generator_to_grammar = ->
  i = ''
  indent = -> i += '  '
  dedent = -> i = i[0..-3]
  
  scopes = []
  scope = {}
  
  class_defs = []
  class_def = {}
  
  push_class = ->
    class_defs.push class_def
    class_def =
      name: ''
      code: ''
      args: []
      has_constructor: no
  pop_class = ->
    class_def = class_defs.pop()
    return class_def
  
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
    var_names = (var_name for var_name, type of scope when type not in ['closure', 'argument', 'function', 'class definition'])
    if wrap
      rv += '(function () {\n'
      indent()
      code = i + code.replace /\n/g, '\n  '
    if var_names.length > 0
      rv += '  var ' + var_names.join(', ') + ';\n' if var_names.length > 0
    rv += code
    if wrap
      dedent()
      rv += "\n#{i}})()\n"
    scope = scopes.pop() if scopes isnt []
    return rv
  
  check_existence_wrapper = (code, undefined_unary, invert) ->
    if undefined_unary
      rv = if invert then "typeof #{code} === 'undefined' || #{code} === null" else "typeof #{code} !== 'undefined' && #{code} !== null"
    else
      rv = if invert then "#{code} == null" else "#{code} != null"
    return rv
  
  self = this
  
  @File::js = ->
    i = ''
    scopes = []
    scope = {}
    class_defs = []
    class_def =
      name: ''
      code: ''
      args: []
      has_constructor: no
    use_snippets = {}
    code = (statement.js() for statement in @statements when not (statement.statement instanceof self.BlankStatement)).join '\n'
    snip = (snippet for key, snippet of use_snippets).join('\n')
    rv = [snip, code].join '\n'
    comment.written = undefined for comment in @ts.comments # reset the AST modifications in case something else wants to use it
    return pop_scope rv, yes, yes
    
  @Statement::js = ->
    rv = ''
    for comment in @ts.comments when comment.line <= @line and not comment.written
      comment.written = yes
      rv += i + '/*' + comment.value + '*/'
    rv += i + @statement.js()
    return rv
    
  @ReturnStatement::js = ->
    return "return #{@expr.js()};"
    
  @ExpressionStatement::js = ->
    rv = @expr.js()
    return if rv isnt "" then rv + ';' else rv
    
  @Expression::js = ->
    rv = ''
    left_code = @left.js()
    if not @op?
      rv += left_code
    else
      opjs = @op.js()
      if opjs is 'in'
        unless use_snippets['in']?
          use_snippets['in'] = snippets['in']
          subscope['$kindexof'] = 'closure' for subscope in scopes
          scope['$kindexof'] = 'closure'
        rv += "$kindexof.call(#{@right.js()}, #{@left.js()}) >= 0"
      else
        rv += "#{left_code} #{opjs} #{@right.js()}"
    rv = @conditional.js(rv) if @conditional?
    return rv
    
  @UnaryExpression::js = ->
    rv = ''
    if @base.type is 'IDENTIFIER'
      rv += KEYWORD_TRANSLATE[@base.value] or @base.value
      scope[@base.value] = 'closures ok' unless scope[@base.value]? or not @is_lvalue() or KEYWORD_TRANSLATE[@base.value]
    else
      rv += @base.js()
    
    # an undefined unary is a simple variable access to an undeclared variable
    # it requres we check if the variable exists before checking if it is null/undefined
    undefined_unary = (@base.type is 'IDENTIFIER' and not scope[@base]?)
    for accessor in @accessors
      rv = accessor.js rv, undefined_unary
      undefined_unary = no # only possible for the first accessor
      
    
    closeout = ""
    invert_closeout = @accessors[@accessors.length-1]?.invert is true
    for accessor in @accessors
      closeout = accessor.js_closeout(invert_closeout) + closeout
    rv += closeout
    
    rv = "#{KEYWORD_TRANSLATE[@preop.value]}(#{rv})" if @preop?.value?
    return rv

  @WhenExpression::js = (true_block_js) ->
    conditional_js = @condition.js()
    conditional_js = "!(#{conditional_js})" if @specifier.value is 'unless' or @specifier.value is 'except'
    if @false_expr?
      return "(#{conditional_js}) ? #{true_block_js} : #{@false_expr.js()}"
    else
      indented_js = '  ' + true_block_js.replace /\n/g, '\n  '
      return "if (#{conditional_js}) {\n#{indented_js}\n#{i}}"
    return rv
  
  @ExisentialCheck::js = (code, undefined_unary) ->
    return check_existence_wrapper code, undefined_unary, @invert
  @ExisentialCheck::js_closeout = (invert) -> return ""
  
  @PropertyAccess::js = (code, undefined_unary) ->
    if @expr.type is 'IDENTIFIER'
      rv = @expr.value
    else
      rv = @expr.js()
    if @exisential
      base = check_existence_wrapper(code, undefined_unary, no, yes) + ' ? ' + code
    else
      base = code
    rv = "#{base}.#{rv}"
  @PropertyAccess::js_closeout = (invert) -> 
    if @exisential
      return if invert then ": true " else " : void 0" 
    else 
      return ""
  
  @AssignmentStatement::js = ->
    rv = "#{@lvalue.js()} #{@assignOp.value} #{@rvalue.js()};"
    rv = @conditional.js(rv) if @conditional?
    return rv
    
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
    conditional_js = @conditional.js()
    conditional_js = "!(#{conditional_js})" if @condition.value is 'unless' or @condition.value is 'except'
    
    rv = "if (#{conditional_js}) {\n#{@true_block.js()}\n#{i}}"
    
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
    rv += "#{i}#{@iterant.js()} = #{terminator}[#{iterator}];\n"
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
    
  @IndexExpression::js = (code, undefined_unary)->
    if @exisential
      base = check_existence_wrapper(code, undefined_unary, no, yes) + ' ? ' + code
    else
      base = code
    return "#{base}[#{@expr.js()}]"
  @IndexExpression::js_closeout = (invert) -> 
      if @exisential
        return if invert then ": true " else " : void 0" 
      else 
        return ""
  
  @ListExpression::js = ->
    rv = (item.js() for item in @items).join(', ')
    return "[#{rv}]"
    
  @MapItem::js = ->
    return "#{@key.js()}: #{@val.js()}"
    
  @MapExpression::js = ->
    rv = (item.js() for item in @items).join(', ')
    return "{ #{rv} }"

  @FunctionExpression::js = ->
    if class_defs.length > 0 and @name? #is a member function/method
      if @specifier.value is 'method' and @name.value is 'initialize'
        class_def.code += @js_constructor()
        return ""
      else
        return @js_class_member()
    else
      return @js_bare_function()
    
  @FunctionExpression::js_bare_function   = ->
    rv = "function "
    rv += @name.value if @name?
    return rv + @js_body (argument.name.value for argument in @arguments)
    
  @FunctionExpression::js_class_member   = ->
    if @specifier.value is 'method'
      rv = "#{class_def.name}.prototype.#{@name.value} = function"
    else
      rv = "#{class_def.name}.#{@name.value} = function"
    return rv + @js_body (argument.name.value for argument in @arguments)
    
  @FunctionExpression::js_constructor = ->
    class_def.has_constructor = yes
    rv = "function #{class_def.name}"
    class_def.args = (argument.name.value for argument in @arguments)
    rv += @js_body class_def.args
    return rv

  @FunctionExpression::js_body = (arg_names) ->
    rv = " (#{arg_names.join(', ')}) {\n"
    push_scope()
    scope[arg_name] = 'argument' for arg_name in arg_names
    block_code = @block.js()
    rv += pop_scope block_code, no, no
    rv += "\n#{i}}"
    return rv
    
  @FunctionCall::js = (code, undefined_unary) ->
    rv = (argument.js() for argument in @arguments).join ', '
    if @exisential
      base = check_existence_wrapper(code, undefined_unary, no, yes) + ' ? ' + code
    else
      base = code
    return "#{base}(#{rv})"
  @FunctionCall::js_closeout = (invert) -> 
      if @exisential
        return if invert then ": true " else " : void 0" 
      else 
        return ""
    
  @FunctionCallArgument::js = ->
    return @val.js()
    
  @ClassDefinition::js = ->
    push_scope()
    push_class()
    class_def.name = @name.value
    block_code = @block.js()
    block_code = pop_scope block_code, no, no
    rv = class_def.code
    unless class_def.has_constructor
      rv += "function #{class_def.name} () {}\n"
    if @parent?
      rv += "#{i}__extends(#{@name.value},#{@parent.value});\n"
      use_snippets['inherits'] = snippets['inherits']
    rv += block_code
    pop_class()
    return rv
  
  snippets =
    'in': 'var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };'
    'inherits': 'var __hasProp = {}.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }'