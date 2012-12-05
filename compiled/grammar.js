(function () {
  var ast, ASTBase, KEYWORDS, Nodes, ki$1, kobj$1, v;
  var __hasProp = {}.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }
  var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  ast = require('./ast');
  ASTBase = ast.ASTBase;
  KEYWORDS = ['true', 'false', 'yes', 'no', 'on', 'off', 'function', 'return', 'if', 'unless', 'except', 'when', 'otherwise', 'and', 'or', 'but', 'xor', 'not', 'new', 'while', 'for', 'else', 'method', 'class', 'exists', 'doesnt', 'exist', 'is', 'isnt', 'inherits', 'from', 'nothing', 'empty', 'null', 'break', 'try', 'catch', 'throw', 'raise', 'arguments', 'of', 'in', 'nor', 'instanceof'];
  function File () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(File,ASTBase);
    File.prototype.parse = function () {
        this.lock();
      
      this.statements = [];
      
      while (!(this.opt('EOF'))) {
          this.statements.push(this.req(Statement));
          
          this.lock();
          
      }
    };
  function Block () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(Block,ASTBase);
    Block.prototype.parse = function () {
        this.req('NEWLINE');
      
      this.lock();
      
      this.req('INDENT');
      
      this.lock();
      
      this.statements = [];
      
      while (!(this.opt('DEDENT'))) {
          this.statements.push(this.req(Statement));
          
          this.lock();
          
      }
    };
  function Statement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(Statement,ASTBase);
    Statement.prototype.parse = function () {
        this.statement = this.req(BlankStatement, TryCatch, ClassDefinition, ReturnStatement, IfStatement, WhileStatement, ForStatement, ThrowStatement, SuperStatement, DeclarationStatement, AssignmentStatement, ExpressionStatement);
      
    };
  function ThrowStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(ThrowStatement,ASTBase);
    ThrowStatement.prototype.parse = function () {
        this.req_val('throw', 'raise');
      
      this.lock();
      
      this.expr = this.req(Expression);
      
      this.conditional = this.expr.transform_when_statement();
      
    };
  function ReturnStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(ReturnStatement,ASTBase);
    ReturnStatement.prototype.parse = function () {
        this.req_val('return');
      
      this.lock();
      
      this.conditional = this.opt(WhenExpression);
      
      if (!((this.conditional != null))) {
        this.expr = this.opt(Expression);
        
        this.conditional = this.expr.transform_when_statement();
        
      }
    };
  function IfStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(IfStatement,ASTBase);
    IfStatement.prototype.parse = function () {
        this.condition = this.req_val('if', 'unless', 'when', 'except');
      
      this.lock();
      
      (this.condition.value === 'except') ? this.req_val('when') : void 0;
      
      this.conditional = this.req(Expression);
      
      this.true_block = this.req(Block, Statement);
      
      this.else_block = this.opt(ElseStatement);
      
    };
  function ElseStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(ElseStatement,ASTBase);
    ElseStatement.prototype.parse = function () {
        this.req_val('else', 'otherwise');
      
      this.lock();
      
      this.false_block = this.req(Block, Statement);
      
    };
  function WhileStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(WhileStatement,ASTBase);
    WhileStatement.prototype.parse = function () {
        this.req_val('while');
      
      this.lock();
      
      this.expr = this.req(Expression);
      
      this.block = this.req(Block);
      
    };
  function ForStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(ForStatement,ASTBase);
    ForStatement.prototype.parse = function () {
        this.req_val('for');
      
      this.lock();
      
      this.iterant = this.req(UnaryExpression);
      
      this.type = this.req_val('in', 'of');
      
      this.iterable = this.req(Expression);
      
      this.loop_block = this.req(Block);
      
    };
  function DeclarationStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(DeclarationStatement,ASTBase);
    DeclarationStatement.prototype.tmp = function () { /*until the spec is changed to allow empty definitions*/
        return;
      
    };
  function AssignmentStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(AssignmentStatement,ASTBase);
    AssignmentStatement.prototype.parse = function () {
        this.lvalue = this.req(UnaryExpression);
      
      this.lvalue.can_be_lvalue = true;
      
      this.assignOp = this.req('LITERAL');
      
      (!(($kindexof.call(['+', '-', '*', '/', '='], this.assignOp.value) >= 0) )) ? this.error(("invalid operator " + (this.assignOp.value))) : void 0;
      
      if (this.assignOp.value !== '=') {
        this.req_val('=');
        
      }
      this.lock();
      
      (!(this.lvalue.is_lvalue())) ? this.error("invalid assignment - the left side must be assignable") : void 0;
      
      this.rvalue = this.req(Expression);
      
      this.conditional = this.rvalue.transform_when_statement();
      
    };
  function ExpressionStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(ExpressionStatement,ASTBase);
    ExpressionStatement.prototype.parse = function () {
        this.expr = this.req(Expression);
      
    };
  function BlankStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(BlankStatement,ASTBase);
    BlankStatement.prototype.parse = function () {
        this.req('NEWLINE');
      
    };
  function BinOp () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(BinOp,ASTBase);
    BinOp.prototype.parse = function () {
        this.invert = false;
      
      this.op = this.req('IDENTIFIER', 'LITERAL');
      
      if (this.op.type === 'LITERAL') {
        (($kindexof.call([')', ']', '}', ';', ':', ','], this.op.value) >= 0) ) ? this.error(("unexpected operator " + (this.op.value))) : void 0;
        
        this.lock();
        
        (!(($kindexof.call(['+', '-', '*', '/', '>', '<', '^', '<=', '>=', '==', '!='], this.op.value) >= 0) )) ? this.error(("unexpected operator " + (this.op.value))) : void 0;
        
      } else {
        if (this.op.value === 'not') {
          this.op = this.req_val('in', 'of');
          
          this.invert = true;
          
        }
        (!(($kindexof.call(['and', 'but', 'or', 'xor', 'nor', 'in', 'is', 'isnt', 'instanceof', 'of'], this.op.value) >= 0) )) ? this.error(("unexpected operator " + (this.op.value))) : void 0;
        
      }
    };
  function Expression () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(Expression,ASTBase);
    Expression.prototype.transform_when_statement = function () {
      var rv;
      if ((this.conditional != null) && (this.conditional.false_expr == null)) {
        rv = this.conditional;
        
        this.conditional = null;
        
        return rv;
        
      } else {
        return null;
        
      }
    };
    Expression.prototype.parse = function () {
        this.left = this.req(UnaryExpression);
      
      this.left.can_be_lvalue = false;
      
      if ((this.left.base instanceof FunctionExpression)) {
        return;
        
      }
      this.op = this.opt(BinOp);
      
      this.lock();
      
      if ((this.op != null)) {
        this.right = this.req(Expression);
        
      }
      this.conditional = this.opt(WhenExpression);
      
    };
  function UnaryExpression () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(UnaryExpression,ASTBase);
    UnaryExpression.prototype.is_lvalue = function () {
      var ki$1, kobj$1, accessor;
      if (this.can_be_lvalue === false) {
    return false;
      }
      
      if (($kindexof.call([NumberConstant, StringConstant, RegexConstant], this.base.constructor) >= 0) ) {
    return false;
      }
      
      if (($kindexof.call(KEYWORDS, this.base.value) >= 0) ) {
    return false;
      }
      
      kobj$1 = this.accessors;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        accessor = kobj$1[ki$1];
          if ((accessor instanceof FunctionCall)) {
            return false;
            
          }
      }
      return true;
      
    };
    UnaryExpression.prototype.parse = function () {
      var first;
      this.preop = this.opt_val('not', 'new', '-');
      
      this.base = this.req(ParenExpression, ListExpression, MapExpression, FunctionExpression, NumberConstant, StringConstant, RegexConstant, 'IDENTIFIER');
  /*if a paren expression occurs immediately after the function block dedent, this would
   * normally be interpreted as a function call on the function expression. While this may
   * be desired it is usually just confusing, so we explicitly avoid it here.*/
      
      if ((this.base instanceof FunctionExpression)) {
        this.accessors = [];
        
        first = this.opt(IndexExpression, PropertyAccess, ExisentialCheck);
        
        if ((first != null)) {
          this.accessors.push(first);
          
          this.accessors = this.accessors.concat(this.opt_multi(IndexExpression, FunctionCall, PropertyAccess, ExisentialCheck));
          
        }
      } else {
        this.accessors = this.opt_multi(IndexExpression, FunctionCall, PropertyAccess, ExisentialCheck);
        
      }
    };
  function ExisentialCheck () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(ExisentialCheck,ASTBase);
    ExisentialCheck.prototype.parse = function () {
      var op;
      op = this.req_val('exists', '?', 'doesnt');
      
      this.lock();
      
      if (op.value === 'doesnt') {
        this.req_val('exist');
        
        this.invert = true;
        
      } else {
        this.invert = false;
        
      }
    };
  function WhenExpression () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(WhenExpression,ASTBase);
    WhenExpression.prototype.parse = function () {
        this.specifier = this.req_val('when', 'except', 'if', 'unless');
      
      this.lock();
      
      (this.specifier.value === 'except') ? this.req_val('when') : void 0;
      
      this.condition = this.req(Expression);
      
      if (this.opt_val('otherwise', 'else')) {
    this.false_expr = this.req(Expression);
      }
      
    };
  function NumberConstant () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(NumberConstant,ASTBase);
    NumberConstant.prototype.parse = function () {
        this.token = this.req('NUMBER');
      
    };
  function StringConstant () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(StringConstant,ASTBase);
    StringConstant.prototype.parse = function () {
        this.token = this.req('STRING');
      
    };
  function RegexConstant () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(RegexConstant,ASTBase);
    RegexConstant.prototype.parse = function () {
        this.token = this.req('REGEX');
      
    };
  function IndexExpression () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(IndexExpression,ASTBase);
    IndexExpression.prototype.parse = function () {
      var op;
      op = this.req_val('[', '?');
      
      this.exisential = (op.value === '?');
      
      (this.exisential) ? this.req_val('[') : void 0;
      
      this.lock();
      
      this.expr = this.req(Expression);
      
      this.req_val(']');
      
    };
  function PropertyAccess () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(PropertyAccess,ASTBase);
    PropertyAccess.prototype.parse = function () {
      var op;
      op = this.req_val('.', '?');
      
      this.exisential = (op.value === '?');
      
      (this.exisential) ? this.req_val('.') : void 0;
      
      this.lock();
      
      this.expr = this.req('IDENTIFIER');
      
    };
  function FunctionCallArgument () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(FunctionCallArgument,ASTBase);
    FunctionCallArgument.prototype.parse = function () {
        this.val = this.req(Expression);
      
      this.lock();
      
      if (this.req_val(',', ')').value === ')') {
        this.ts.prev();
        
      }
    };
  function FunctionCall () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(FunctionCall,ASTBase);
    FunctionCall.prototype.parse = function () {
      var op;
      op = this.req_val('(', '?');
      
      this.exisential = (op.value === '?');
      
      (this.exisential) ? this.req_val('(') : void 0;
      
      this.lock();
      
      this.arguments = this.opt_multi(FunctionCallArgument);
      
      this.req_val(')');
      
    };
  function ParenExpression () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(ParenExpression,ASTBase);
    ParenExpression.prototype.parse = function () {
        this.req_val('(');
      
      this.lock();
      
      this.expr = this.req(Expression);
      
      this.req_val(')');
      
    };
  function ListExpression () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(ListExpression,ASTBase);
    ListExpression.prototype.parse = function () {
      var item;
      this.req_val('[');
      
      this.lock();
      
      this.comprehension = this.opt(ListComprehension);
      
      if ((this.comprehension == null)) {
        this.items = [];
        
        item = this.opt(Expression);
        
        while (item) {
            this.items.push(item);
            
            if (this.opt_val(',')) {
              item = this.opt(Expression);
              
            } else {
              item = null;
              
            }
        }
      }
      this.req_val(']');
      
    };
  function ListComprehension () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(ListComprehension,ASTBase);
    ListComprehension.prototype.parse = function () {
        this.iter_expr = this.req(Expression);
      
      this.req_val('for');
      
      this.lock();
      
      this.iterant = this.req('IDENTIFIER');
      
      this.req_val('in');
      
      this.iterable = this.req(Expression);
      
    };
  function MapItem () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(MapItem,ASTBase);
    MapItem.prototype.parse = function () {
        this.key = this.req(Expression);
      
      this.req_val(':');
      
      this.lock();
      
      this.val = this.req(Expression);
      
      this.end_token = this.req_val(',', '}');
      
      if (this.end_token.value === '}') {
        this.ts.prev();
        
      }
    };
  function MapExpression () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(MapExpression,ASTBase);
    MapExpression.prototype.parse = function () {
        this.req_val('{');
      
      this.lock();
      
      this.items = this.opt_multi(MapItem);
      
      this.req_val('}');
      
    };
  function Ellipsis () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(Ellipsis,ASTBase);
    Ellipsis.prototype.parse = function () {
        this.req_val('.');
      
      this.req_val('.');
      
      this.req_val('.');
      
    };
  function FunctionDefArgument () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(FunctionDefArgument,ASTBase);
    FunctionDefArgument.prototype.parse = function () {
        this.name = this.req('IDENTIFIER');
      
      this.lock();
      
      if (this.req_val(',', ')').value === ')') {
        this.ts.prev();
        
      }
    };
  function FunctionExpression () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(FunctionExpression,ASTBase);
    FunctionExpression.prototype.parse = function () {
        this.specifier = this.req_val('function', 'method');
      
      this.lock();
      
      this.name = this.opt('IDENTIFIER');
      
      this.req_val('(');
      
      this.arguments = this.opt_multi(FunctionDefArgument);
      
      this.req_val(')');
      
      this.block = this.req(Block);
      
    };
  function ClassDefinition () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(ClassDefinition,ASTBase);
    ClassDefinition.prototype.parse = function () {
        this.req_val('class');
      
      this.lock();
      
      this.name = this.opt('IDENTIFIER');
      
      if (this.opt_val('inherits')) {
        this.req_val('from');
        
        this.parent = this.req('IDENTIFIER');
        
      }
      this.block = this.req(Block);
      
    };
  function TryCatch () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(TryCatch,ASTBase);
    TryCatch.prototype.parse = function () {
        this.req_val('try');
      
      this.lock();
      
      this.try_block = this.req(Block);
      
      if (this.opt_val('catch')) {
        this.identifier = this.req('IDENTIFIER');
        
        this.catch_block = this.req(Block);
        
      }
    };
  function SuperStatement () {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }__extends(SuperStatement,ASTBase);
    SuperStatement.prototype.parse = function () {
        this.req_val('super');
      
      this.lock();
      
      this.accessor = this.opt(FunctionCall);
      
    };
  Nodes = [File, Block, Statement, ThrowStatement, ReturnStatement, IfStatement, ElseStatement, WhileStatement, ForStatement, DeclarationStatement, AssignmentStatement, ExpressionStatement, BlankStatement, BinOp, Expression, UnaryExpression, ExisentialCheck, WhenExpression, NumberConstant, StringConstant, RegexConstant, IndexExpression, PropertyAccess, FunctionCallArgument, FunctionCall, ParenExpression, ListExpression, ListComprehension, MapItem, MapExpression, Ellipsis, FunctionDefArgument, FunctionExpression, ClassDefinition, TryCatch, SuperStatement];
  exports.Grammar = {  };
  kobj$1 = Nodes;
  for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
    v = kobj$1[ki$1];
      exports.Grammar[v.name] = v;
      
  }
  exports.GrammarRoot = exports.Grammar.File;
  exports.KEYWORDS = KEYWORDS;
})()
