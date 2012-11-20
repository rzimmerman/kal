{ASTBase} = require '../kal/ast'

KEYWORDS = ['true','false','yes','no','on','off','function','return','if','unless','except','when','otherwise',
            'and','or','but','xor','not','new','while','for','else','method','class','exists','doesnt','exist',
              'is','isnt','inherits','from','nothing','empty','null','break','try','catch','throw','raise','arguments']

Nodes = [
  class File extends ASTBase
    parse: ->
      @lock()
      @statements = @opt_multi Statement
      @req 'EOF'

  class Block extends ASTBase
    parse: ->
      @req 'NEWLINE'
      @req 'INDENT'
      @lock()
      @statements = @opt_multi Statement
      @req 'DEDENT'
      
  class Statement extends ASTBase
    parse: ->
      @statement = @req TryCatch, ClassDefinition, ReturnStatement, IfStatement, WhileStatement, ForStatement, 
                        DeclarationStatement, AssignmentStatement, ExpressionStatement, BlankStatement
    
  class ReturnStatement extends ASTBase
    parse: ->
      @req_val 'return'
      @lock()
      @expr = @opt Expression
      @req 'NEWLINE'
  
  class IfStatement extends ASTBase
    parse: ->
      @condition = @req_val 'if', 'unless', 'when', 'except'
      @lock()
      @req_val 'when' if @condition.value is 'except'
      @conditional = @req Expression
      @true_block = @req Block, Statement
      @else_block = @opt ElseStatement
        
  class ElseStatement extends ASTBase
    parse: ->
      @req_val 'else', 'otherwise'
      @lock()
      @false_block = @req Block, Statement
  
  class WhileStatement extends ASTBase
    parse: ->
      @req_val 'while'
      @lock()
      @expr = @req Expression
      @block = @req Block
    
  class ForStatement extends ASTBase
    parse: ->
      @req_val 'for'
      @lock()
      @iterant = @req UnaryExpression
      @req_val 'in'
      @iterable = @req Expression
      @loop_block = @req Block
      
  class DeclarationStatement extends ASTBase
  class AssignmentStatement extends ASTBase
    parse: ->
      @lvalue   = @req UnaryExpression
      @assignOp = @req 'LITERAL'
      @error 'invalid operator ' + @assignOp.value if @assignOp.value not in ['+','-','*','/','=']
      if @assignOp.value isnt '='
        @req_val '='
      @lock()
      @error 'invalid assignment - the left side must be assignable' unless @lvalue.is_lvalue()
      @rvalue   = @req Expression
      @req 'NEWLINE'
      @conditional = @rvalue.transform_when_statement()
        

  class ExpressionStatement extends ASTBase
    parse: ->
      @expr = @req Expression

      
  class BlankStatement extends ASTBase
    parse: ->
      @req 'NEWLINE'

  class BinOp extends ASTBase
    parse: ->
      @op = @req 'IDENTIFIER', 'LITERAL'
      if @op.type is 'LITERAL'
        @error "unexpected operator #{@op.value}" if @op.value in [')',']','}',';',':',',']
        @lock()
        @error "unexpected operator #{@op.value}" if @op.value not in ['+','-','*','/','>','<']
      else
        @error "unexpected operator #{@op.value}" if @op.value not in ['and','but','or','xor','in','is','isnt']
      
  class Expression extends ASTBase
    transform_when_statement: ->
      if @conditional? and not @conditional.false_expr?
        rv = @conditional
        @conditional = undefined
        return rv
      else
        return undefined
    parse: ->
      @left  = @req UnaryExpression
      @op    = @opt BinOp
      @lock()
      if @op?
        @right = @req Expression
      @conditional = @opt WhenExpression
      
  class UnaryExpression extends ASTBase
    is_lvalue: ->
      return no if @base.constructor in [NumberConstant, StringConstant, RegexConstant]
      return no if @base.value in KEYWORDS
      for accessor in @accessors
        return no if accessor instanceof FunctionCall
      return yes
    parse: ->
      @preop      = @opt_val 'not', 'new'
      @base        = @req ParenExpression, ListExpression, MapExpression, FunctionExpression, NumberConstant, StringConstant, RegexConstant, 'IDENTIFIER'
      @accessors   = @opt_multi IndexExpression, FunctionCall, PropertyAccess, ExisentialCheck
  
  class ExisentialCheck extends ASTBase
    parse: ->
      op = @req_val 'exists', '?', 'doesnt'
      @lock()
      if op.value is 'doesnt'
        @req_val 'exist'
        @invert = yes
      else
        @invert = no
      
  class WhenExpression extends ASTBase
    parse: ->
      @specifier  = @req_val 'when', 'except', 'if', 'unless'
      @lock()
      @req_val 'when' if @specifier.value is 'except'
      @condition  = @req Expression
      @false_expr = @req Expression if @opt_val 'otherwise', 'else'
    
  class NumberConstant extends ASTBase
    parse: ->
      @token = @req 'NUMBER'
  
  class StringConstant extends ASTBase
    parse: ->
      @token = @req 'STRING'
  
  class RegexConstant extends ASTBase
    parse: ->
      @token = @req 'REGEX'
  
  class IndexExpression extends ASTBase
    parse: ->
      op = @req_val '[', '?'
      @exisential = (op.value is '?')
      @req_val '[' if @exisential
      @lock()
      @expr = @req Expression
      @req_val ']'
  
  class PropertyAccess extends ASTBase
    parse: ->
      op = @req_val '.', '?'
      @exisential = (op.value is '?')
      @req_val '.' if @exisential
      @lock()
      @expr = @req FunctionExpression, 'IDENTIFIER'
  
  class FunctionCallArgument extends ASTBase
    parse: ->
      @val = @req Expression
      @lock()
      if @req_val(',',')').value is ')'
        @ts.prev()
  
  class FunctionCall extends ASTBase
    parse: ->
      op = @req_val '(', '?'
      @exisential = (op.value is '?')
      @req_val '(' if @exisential
      @lock()
      @arguments = @opt_multi FunctionCallArgument
      @req_val ')'
    
  class ParenExpression extends ASTBase
    parse: ->
      @req_val '('
      @lock()
      @expr = @req Expression
      @req_val ')'
      
  class ListExpression extends ASTBase
    parse: ->
      @req_val '['
      @lock()
      @items = []
      item = @opt Expression
      while item
        @items.push item
        if @opt_val ','
          item = @opt Expression
        else
          item = null
      @req_val ']'
  
  class MapItem extends ASTBase
    parse: ->
      @key = @req Expression
      @req_val ':'
      @lock()
      @val = @req Expression
      @end_token = @req_val ',', '}'
      if @end_token.value is '}'
        @ts.prev()
      
  class MapExpression extends ASTBase
    parse: ->
      @req_val '{'
      @lock()
      @items = @opt_multi MapItem
      @req_val '}'
      
    
  class Ellipsis extends ASTBase
    parse: ->
      @req_val '.'
      @req_val '.'
      @req_val '.'
    
    
  class FunctionDefArgument extends ASTBase
    parse: ->
      @name = @req 'IDENTIFIER'
      @lock()
      if @req_val(',',')').value is ')'
        @ts.prev()
      
  class FunctionExpression extends ASTBase
    parse: ->
      @specifier = @req_val 'function', 'method'
      @lock()
      @name = @opt 'IDENTIFIER'
      @req_val '('
      @arguments = @opt_multi FunctionDefArgument
      @req_val ')'
      @block = @req Block
  
  class ClassDefinition extends ASTBase
    parse: ->
      @req_val 'class'
      @lock()
      @name = @opt 'IDENTIFIER'
      if @opt_val 'inherits'
        @req_val 'from'
        @parent = @req 'IDENTIFIER'
      @block = @req Block

  class TryCatch extends ASTBase
    parse: ->
      @req_val 'try'
      @lock()
      @try_block = @req Block
      if @opt_val 'catch'
        @identifier = @req 'IDENTIFIER'
        @catch_block = @req Block
]

exports.Grammar = {}
exports.Grammar[v.name] = v for v in Nodes when v.__super__?.constructor is ASTBase
exports.GrammarRoot = exports.Grammar.File
exports.KEYWORDS = KEYWORDS
