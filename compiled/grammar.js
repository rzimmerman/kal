(function () {
  var ast, ASTBase, KEYWORDS, Nodes, ki$1, kobj$1, v;
  var __hasProp = {}.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }
  var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  ast = require('./ast');
  ASTBase = ast.ASTBase;
  KEYWORDS = ['true', 'false', 'yes', 'no', 'on', 'off', 'function', 'return', 'if', 'unless', 'except', 'when', 'otherwise', 'and', 'or', 'but', 'xor', 'not', 'new', 'while', 'for', 'else', 'method', 'class', 'exists', 'doesnt', 'exist', 'is', 'isnt', 'inherits', 'from', 'nothing', 'empty', 'null', 'break', 'try', 'catch', 'throw', 'raise', 'arguments'];
  function File () {}
  __extends(File,ASTBase);
    File.prototype.parse = function () {
        this.lock();
      
      this.statements = this.opt_multi(Statement);
      this.req('EOF');
      
    };
  function Block () {}
  __extends(Block,ASTBase);
    Block.prototype.parse = function () {
        this.req('NEWLINE');
      
      this.req('INDENT');
      
      this.lock();
      
      this.statements = this.opt_multi(Statement);
      this.req('DEDENT');
      
      
    };
  function Statement () {}
  __extends(Statement,ASTBase);
    Statement.prototype.parse = function () {
        this.statement = this.req(TryCatch, ClassDefinition, ReturnStatement, IfStatement, WhileStatement, ForStatement, DeclarationStatement, AssignmentStatement, ExpressionStatement, BlankStatement);
    };
    
  function ReturnStatement () {}
  __extends(ReturnStatement,ASTBase);
    ReturnStatement.prototype.parse = function () {
        this.req_val('return');
      
      this.lock();
      
      this.expr = this.opt(Expression);
      this.req('NEWLINE');
      
      this.conditional = this.expr.transform_when_statement();
    };
  function IfStatement () {}
  __extends(IfStatement,ASTBase);
    IfStatement.prototype.parse = function () {
        this.condition = this.req_val('if', 'unless', 'when', 'except');
      this.lock();
      
      if ((this.condition.value === 'except')) {
    this.req_val('when')
      };
      
      this.conditional = this.req(Expression);
      this.true_block = this.req(Block, Statement);
      this.else_block = this.opt(ElseStatement);
      
    };
  function ElseStatement () {}
  __extends(ElseStatement,ASTBase);
    ElseStatement.prototype.parse = function () {
        this.req_val('else', 'otherwise');
      
      this.lock();
      
      this.false_block = this.req(Block, Statement);
    };
  function WhileStatement () {}
  __extends(WhileStatement,ASTBase);
    WhileStatement.prototype.parse = function () {
        this.req_val('while');
      
      this.lock();
      
      this.expr = this.req(Expression);
      this.block = this.req(Block);
    };
    
  function ForStatement () {}
  __extends(ForStatement,ASTBase);
    ForStatement.prototype.parse = function () {
        this.req_val('for');
      
      this.lock();
      
      this.iterant = this.req(UnaryExpression);
      this.req_val('in');
      
      this.iterable = this.req(Expression);
      this.loop_block = this.req(Block);
      
    };
  function DeclarationStatement () {}
  __extends(DeclarationStatement,ASTBase);
    DeclarationStatement.prototype.parse = function () {
        return;
      
      
    };
  function AssignmentStatement () {}
  __extends(AssignmentStatement,ASTBase);
    AssignmentStatement.prototype.parse = function () {
        this.lvalue = this.req(UnaryExpression);
      this.lvalue.can_be_lvalue = true;
      this.assignOp = this.req('LITERAL');
      if ((!(($kindexof.call(['+', '-', '*', '/', '='], this.assignOp.value) >= 0)))) {
    this.error('invalid operator ' + this.assignOp.value)
      };
      
      if (this.assignOp.value !== '=') {
        this.req_val('=');
        
      }
      this.lock();
      
      if (!((this.lvalue.is_lvalue()))) {
    this.error('invalid assignment - the left side must be assignable')
      };
      
      this.rvalue = this.req(Expression);
      this.req('NEWLINE');
      
      this.conditional = this.rvalue.transform_when_statement();
      
    };
  function ExpressionStatement () {}
  __extends(ExpressionStatement,ASTBase);
    ExpressionStatement.prototype.parse = function () {
        this.expr = this.req(Expression);
      
    };
  function BlankStatement () {}
  __extends(BlankStatement,ASTBase);
    BlankStatement.prototype.parse = function () {
        this.req('NEWLINE');
      
    };
  function BinOp () {}
  __extends(BinOp,ASTBase);
    BinOp.prototype.parse = function () {
        this.op = this.req('IDENTIFIER', 'LITERAL');
      if (this.op.type === 'LITERAL') {
        if (($kindexof.call([')', ']', '}', ';', ':', ','], this.op.value) >= 0)) {
    this.error("unexpected operator " + me.op.value + "")
        };
        
        this.lock();
        
        if (!(($kindexof.call(['+', '-', '*', '/', '>', '<'], this.op.value) >= 0))) {
    this.error("unexpected operator " + me.op.value + "")
        };
        
      } else {
        if (!(($kindexof.call(['and', 'but', 'or', 'xor', 'in', 'is', 'isnt', 'instanceof'], this.op.value) >= 0))) {
    this.error("unexpected operator " + me.op.value + "")
        };
        
      }
      
    };
  function Expression () {}
  __extends(Expression,ASTBase);
    Expression.prototype.transform_when_statement = function () {
      var rv;
      if (this.conditional != null && this.conditional.false_expr == null) {
        rv = this.conditional;
        this.conditional = undefined;
        return rv;
      } else {
        return undefined;
      }
    };
    Expression.prototype.parse = function () {
        this.left = this.req(UnaryExpression);
      this.left.can_be_lvalue = false;
      this.op = this.opt(BinOp);
      this.lock();
      
      if (this.op != null) {
        this.right = this.req(Expression);
      }
      this.conditional = this.opt(WhenExpression);
      
    };
  function UnaryExpression () {}
  __extends(UnaryExpression,ASTBase);
    UnaryExpression.prototype.is_lvalue = function () {
      var ki$1, kobj$1, accessor;
      if (!((this.can_be_lvalue))) {
    return false;
      }
      if (($kindexof.call([NumberConstant, StringConstant, RegexConstant], this.base.constructor) >= 0)) {
    return false;
      }
      if (($kindexof.call((KEYWORDS), this.base.value) >= 0)) {
    return false;
      }
      kobj$1 = (this.accessors);
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        accessor = kobj$1[ki$1];
          if ((accessor instanceof (FunctionCall))) {
    return false;
          }
      }
      return true;
    };
    UnaryExpression.prototype.parse = function () {
        this.preop = this.opt_val('not', 'new');
      this.base = this.req(ParenExpression, ListExpression, MapExpression, FunctionExpression, NumberConstant, StringConstant, RegexConstant, 'IDENTIFIER');
      this.accessors = this.opt_multi(IndexExpression, FunctionCall, PropertyAccess, ExisentialCheck);
    };
  function ExisentialCheck () {}
  __extends(ExisentialCheck,ASTBase);
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
  function WhenExpression () {}
  __extends(WhenExpression,ASTBase);
    WhenExpression.prototype.parse = function () {
        this.specifier = this.req_val('when', 'except', 'if', 'unless');
      this.lock();
      
      if (this.specifier.value === 'except') {
    this.req_val('when')
      };
      
      this.condition = this.req(Expression);
      if ((this.opt_val('otherwise', 'else'))) {
    this.false_expr = this.req(Expression);
      }
    };
    
  function NumberConstant () {}
  __extends(NumberConstant,ASTBase);
    NumberConstant.prototype.parse = function () {
        this.token = this.req('NUMBER');
    };
  function StringConstant () {}
  __extends(StringConstant,ASTBase);
    StringConstant.prototype.parse = function () {
        this.token = this.req('STRING');
    };
  function RegexConstant () {}
  __extends(RegexConstant,ASTBase);
    RegexConstant.prototype.parse = function () {
        this.token = this.req('REGEX');
    };
  function IndexExpression () {}
  __extends(IndexExpression,ASTBase);
    IndexExpression.prototype.parse = function () {
      var op;
      op = this.req_val('[', '?');
      this.exisential = (op.value === '?');
      if (this.exisential) {
    this.req_val('[')
      };
      
      this.lock();
      
      this.expr = this.req(Expression);
      this.req_val(']');
      
    };
  function PropertyAccess () {}
  __extends(PropertyAccess,ASTBase);
    PropertyAccess.prototype.parse = function () {
      var op;
      op = this.req_val('.', '?');
      this.exisential = (op.value === '?');
      if (this.exisential) {
    this.req_val('.')
      };
      
      this.lock();
      
      this.expr = this.req(FunctionExpression, 'IDENTIFIER');
    };
  function FunctionCallArgument () {}
  __extends(FunctionCallArgument,ASTBase);
    FunctionCallArgument.prototype.parse = function () {
        this.val = this.req(Expression);
      this.lock();
      
      if (this.req_val(',', ')').value === ')') {
        this.ts.prev();
        
      }
    };
  function FunctionCall () {}
  __extends(FunctionCall,ASTBase);
    FunctionCall.prototype.parse = function () {
      var op;
      op = this.req_val('(', '?');
      this.exisential = (op.value === '?');
      if (this.exisential) {
    this.req_val('(')
      };
      
      this.lock();
      
      this.arguments = this.opt_multi(FunctionCallArgument);
      this.req_val(')');
      
    };
    
  function ParenExpression () {}
  __extends(ParenExpression,ASTBase);
    ParenExpression.prototype.parse = function () {
        this.req_val('(');
      
      this.lock();
      
      this.expr = this.req(Expression);
      this.req_val(')');
      
      
    };
  function ListExpression () {}
  __extends(ListExpression,ASTBase);
    ListExpression.prototype.parse = function () {
      var item;
      this.req_val('[');
      
      this.lock();
      
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
      this.req_val(']');
      
    };
  function MapItem () {}
  __extends(MapItem,ASTBase);
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
  function MapExpression () {}
  __extends(MapExpression,ASTBase);
    MapExpression.prototype.parse = function () {
        this.req_val('{');
      
      this.lock();
      
      this.items = this.opt_multi(MapItem);
      this.req_val('}');
      
      
    };
    
  function Ellipsis () {}
  __extends(Ellipsis,ASTBase);
    Ellipsis.prototype.parse = function () {
        this.req_val('.');
      
      this.req_val('.');
      
      this.req_val('.');
      
    };
    
    
  function FunctionDefArgument () {}
  __extends(FunctionDefArgument,ASTBase);
    FunctionDefArgument.prototype.parse = function () {
        this.name = this.req('IDENTIFIER');
      this.lock();
      
      if (this.req_val(',', ')').value === ')') {
        this.ts.prev();
        
      }
      
    };
  function FunctionExpression () {}
  __extends(FunctionExpression,ASTBase);
    FunctionExpression.prototype.parse = function () {
        this.specifier = this.req_val('function', 'method');
      this.lock();
      
      this.name = this.opt('IDENTIFIER');
      this.req_val('(');
      
      this.arguments = this.opt_multi(FunctionDefArgument);
      this.req_val(')');
      
      this.block = this.req(Block);
    };
  function ClassDefinition () {}
  __extends(ClassDefinition,ASTBase);
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
  function TryCatch () {}
  __extends(TryCatch,ASTBase);
    TryCatch.prototype.parse = function () {
        this.req_val('try');
      
      this.lock();
      
      this.try_block = this.req(Block);
      if (this.opt_val('catch')) {
        this.identifier = this.req('IDENTIFIER');
        this.catch_block = this.req(Block);
      }
    };
  Nodes = [File, Block, Statement, ReturnStatement, IfStatement, ElseStatement, WhileStatement, ForStatement, DeclarationStatement, AssignmentStatement, ExpressionStatement, BlankStatement, BinOp, Expression, UnaryExpression, ExisentialCheck, WhenExpression, NumberConstant, StringConstant, RegexConstant, IndexExpression, PropertyAccess, FunctionCallArgument, FunctionCall, ParenExpression, ListExpression, MapItem, MapExpression, Ellipsis, FunctionDefArgument, FunctionExpression, ClassDefinition, TryCatch];
  exports.Grammar = {  };
  kobj$1 = (Nodes);
  for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
    v = kobj$1[ki$1];
      if (v.__super__ != null ? v.__super__.constructor : void 0 === ASTBase) {
      
      }
      exports.Grammar[v.name] = v;
  }
  exports.GrammarRoot = exports.Grammar.File;
  exports.KEYWORDS = KEYWORDS;
})()
