{ASTBase} = require './ast'

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
      @statement = @req ReturnStatement, IfStatement, WhileStatement, ForStatement, 
                        DeclarationStatement, AssignmentStatement, ExpressionStatement
      @lock()
    
  class ReturnStatement extends ASTBase
    parse: ->
      @req_val 'return'
      @lock()
      @expr = @opt Expression
      @req 'NEWLINE'
  
  class IfStatement extends ASTBase
    parse: ->
      @req_val 'if'
      @lock()
      @conditional = @req Expression
      @true_block = @req Block, Statement
      @else_block = @opt ElseStatement
        
  class ElseStatement extends ASTBase
    parse: ->
      @req_val 'else'
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
      if @assignOp.value in ['+','-','*','/']
        @req_val '='
        @assignOp.value += '='
      else if @assignOp.value isnt '='
        @error "not a valid assignment operator: #{assignOp.value}" if @assignOp.value not in ['=']
      @lock()
      @error 'invalid assignment - the left side must be assignable' unless @lvalue.is_lvalue()
      @rvalue   = @req Expression
      @req 'NEWLINE'

  class ExpressionStatement extends ASTBase
    parse: ->
      @expr = @req Expression
      @req 'NEWLINE'
      
  class BlankStatment extends ASTBase
    parse: ->
      @req 'NEWLINE'

  class BinOp extends ASTBase
    parse: ->
      @op = @req 'IDENTIFIER', 'LITERAL'
      if @op.type is 'LITERAL'
        @error "unexpected operator #{@op.value}" if @op.value in [')',']','}',';',':',',']
        @lock()
        @error "unexpected operator #{@op.value}" if @op.value not in ['+','-','*','/']
      else
        @error "unexpected operator #{@op.value}" if @op.value not in ['and','or','xor','in','is']
  class Expression extends ASTBase
    parse: ->
      @left  = @req UnaryExpression
      @op    = @opt BinOp
      if @op?
        @lock()
        @right = @req Expression
    
  class UnaryExpression extends ASTBase
    is_lvalue: ->
      return (@base.constructor not in [NumberConstant, StringConstant])
    parse: ->
      @base    = @req ParenExpression, ListExpression, NumberConstant, StringConstant, 'IDENTIFIER'
      @accessors = @opt_multi IndexExpression
      
  class NumberConstant extends ASTBase
    parse: ->
      @token = @req 'NUMBER'
    
  class StringConstant extends ASTBase
    parse: ->
      @token = @req 'STRING'
  
  class IndexExpression extends ASTBase
    parse: ->
      @req_val '['
      @lock()
      @expr = @req Expression
      @req_val ']'
      
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
      
  class MapExpression extends ASTBase
]

exports.Grammar = {}
exports.Grammar[v.name] = v for v in Nodes when v.__super__?.constructor is ASTBase
exports.GrammarRoot = exports.Grammar.File