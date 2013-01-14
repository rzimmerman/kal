(function () {
  var KEYWORD_TRANSLATE, load;
  var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  var $kcomprl = function (iterable,func) {var o = []; if (iterable instanceof Array) {for (var i=0;i<iterable.length;i++) {o.push(func(iterable[i]));}} else if (typeof(iterable.next) == "function") {var i; while ((i = iterable.next()) != null) {o.push(func(i));}} else {throw "Object is not iterable";}return o;};
  KEYWORD_TRANSLATE = { 'yes': 'true', 'on': 'true', 'no': 'false', 'off': 'false', 'is': '===', 'isnt': '!==', '==': '===', '!=': '!==', 'and': '&&', 'but': '&&', 'or': '||', 'xor': '^', '^': 'pow', 'not': '!', 'new': 'new ', 'me': 'this', 'this': 'this', 'null': 'null', 'nothing': 'null', 'none': 'null', 'break': 'break', 'throw': 'throw', 'raise': 'throw', 'instanceof': 'instanceof', 'of': 'in', 'EndOfList': 'undefined', 'fail': 'throw' };
  load = function load (grammar) {
    apply_generator_to_grammar.apply(grammar);
    
  };
  exports.load = load;
  function apply_generator_to_grammar () {
    var scopes, scope, try_block_stack, try_block_stacks, callback_counter, current_callback, current_callbacks, class_defs, class_def, use_snippets, self, for_depth, snippets;
    scopes = [];
    
    scope = {  };
    
    try_block_stack = [];
    
    try_block_stacks = [];
    
    callback_counter = 0;
    
    current_callback = "k$cb0";
    
    current_callbacks = [];
    
    function create_callback () {
        callback_counter += 1;
      
      current_callback = ("k$cb" + callback_counter);
      
      return current_callback;
      
    };
    function cancel_callback () {
        if (callback_counter > 0) {
    callback_counter -= 1;
      }
      
      current_callback = ("k$cb" + callback_counter);
      
      return current_callback;
      
    };
    class_defs = [];
    
    class_def = {  };
    
    function push_class () {
        class_defs.push(class_def);
      
      class_def = { name: '', code: '', args: [], has_constructor: false };
      
    };
    function pop_class () {
        class_def = class_defs.pop();
      
      return class_def;
      
    };
    use_snippets = {  };
    
    function push_scope () {
      var new_scope, ki$1, kobj$1, k, v;
      scopes.push(scope);
      
      try_block_stacks.push(try_block_stack);
      
      try_block_stack = [];
      
      new_scope = {  };
      
      current_callbacks.push(current_callback);
      
      kobj$1 = scope;
  for (k in kobj$1) {
          v = scope[k];
          
          if (v === 'no closures') {
            v = v; /*do nothing*/
            
          } else         if (v === 'closures ok' || v === 'argument' || v === 'function') {
            new_scope[k] = 'closure';
            
          } else         if (v === 'closure') {
            new_scope[k] = 'closure';
            
          }
      }
      scope = new_scope;
      
    };
    function pop_scope (code, wrap) {
      var rv, var_names, ki$1, kobj$1, var_name;
      rv = "";
      
      var_names = [];
      
      kobj$1 = scope;
  for (var_name in kobj$1) {
          if (!((($kindexof.call(['closure', 'argument', 'function', 'class definition'], scope[var_name]) >= 0) )) && var_name !== 'k$next') {
            var_names.push(var_name);
            
          }
      }
      if (wrap) {
        rv += '(function () {';
        
      }
      if (var_names.length > 0) {
        rv += 'var ' + var_names.join(', ') + ';';
        
      }
      rv += code;
      
      if (wrap) {
        rv += "})()";
        
      }
      if (scopes !== []) {
        scope = scopes.pop();
        
      }
      try_block_stack = try_block_stacks.pop();
      
      current_callback = current_callbacks.pop();
      
      return rv;
      
    };
    function check_existence_wrapper (code, undefined_unary, invert) {
      var rv;
      if (undefined_unary) {
        rv = (invert) ? ("(typeof " + code + " === 'undefined' || " + code + " === null)") : ("(typeof " + code + " !== 'undefined' && " + code + " !== null)");
        
      } else {
        rv = (invert) ? ("" + code + " == null") : ("" + code + " != null");
        
      }
      return rv;
      
    };
    self = this;
    
    this.File.prototype.js = function  (options) {
      var code, snip, ki$1, kobj$1, key, rv, comment;
      scopes = [];
      
      scope = {  };
      
      try_block_stack = [];
      
      try_block_stacks = [];
      
      callback_counter = 0;
      
      current_callback = 'k$cb0';
      
      current_callbacks = [];
      
      class_defs = [];
      
      class_def = { name: '', code: '', args: [], has_constructor: false };
      
      use_snippets = {  };
      
      this.callback = current_callback;
      
      code = self.Block.prototype.js.apply(this);
      
      snip = [];
      
      kobj$1 = use_snippets;
  for (key in kobj$1) {
          snip.push(use_snippets[key]);
          
      }
      snip = snip.join('\n');
      
      rv = [snip, code].join('\n');
      
      kobj$1 = this.ts.comments; /*reset the AST modifications in case something else wants to use it*/
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        comment = kobj$1[ki$1];
          comment.written = null;
          
      }
      return pop_scope(rv, !(options.bare));
      
    };
    this.Statement.prototype.js = function  () {
      var rv, pf, ki$1, kobj$1, comment;
      rv = '';
      
      pf = '';
      
      kobj$1 = this.ts.comments;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        comment = kobj$1[ki$1];
          if (comment.line < this.line + 1 && !(comment.written)) {
            comment.written = true;
            
            if (comment.post_fix) {
              if (comment.multiline) {
    pf += '\n';
              }
              
              if (!(comment.multiline)) {
    pf += ' ';
              }
              
              pf += '/*' + comment.value + '*/';
              
            } else {
              rv += '/*' + comment.value + '*/\n';
              
            }
          }
      }
      this.statement.in_conditional = this.in_conditional;
      
      this.statement.parent_block = this.parent_block;
      
      this.statement.callback = this.callback;
      
      this.statement.original_callback = this.original_callback;
      
      rv += this.statement.js();
      
      if (pf !== '') {
        if (rv.match(/\n/)) {
          rv = rv.replace(/\n/, pf + '\n');
          
        } else {
          rv += pf;
          
        }
      }
      return rv;
      
    };
    this.ThrowStatement.prototype.js = function  () {
      var rv;
      if ((scope['k$next'] != null)) {
        rv = ("return k$next.apply(this, [" + (this.expr.js()) + "]);");
        
      } else {
        rv = ("throw " + (this.expr.js()) + ";");
        
      }
      if ((this.conditional != null)) {
    rv = this.conditional.js(rv, false);
      }
      
      return rv;
      
    };
    this.ReturnStatement.prototype.js = function  () {
      var exprs_js, expr, arg_list, rv;
      exprs_js = $kcomprl(this.exprs,function($ki){expr = $ki;return expr.js();});
      
      ((this.parent_block.callback != null)) ? exprs_js.unshift('null') : void 0;
      
      arg_list = exprs_js.join(', ');
      
      if ((scope['k$next'] != null)) {
        scope['k$rv'] = 'no closures';
        
        rv = ("k$rv = [" + arg_list + "]; return k$next.apply(this, k$rv);");
        
        if ((this.conditional != null)) {
    rv = this.conditional.js(rv, false);
        }
        
        return rv;
        
      } else {
        rv = "return";
        
        if (this.exprs.length === 1) {
          rv += " " + arg_list;
          
        } else       if (this.exprs.length > 1) {
          rv += ("[" + arg_list + "]");
          
        }
        rv += ";";
        
        if ((this.conditional != null)) {
    rv = this.conditional.js(rv, false);
        }
        
        return rv;
        
      }
    };
    this.ExpressionStatement.prototype.js = function  () {
      var rv;
      rv = this.expr.js();
      
      if (rv === "") {
        return "";
        
      } else {
        return rv + ";";
        
      }
    };
    this.Expression.prototype.js = function  (oop_reverse) {
      var rv, left_code, opjs, ki$1, kobj$1, subscope;
      rv = '';
      
      if (oop_reverse) {
        left_code = '';
        
      } else {
        left_code = this.left.js();
        
      }
      if (!((this.op != null))) {
        rv += left_code;
        
      } else {
        opjs = this.op.js();
        
        if (opjs === 'in' && this.op.op.value !== 'of') {
          if (!((use_snippets['in'] != null))) {
            use_snippets['in'] = snippets['in'];
            
            kobj$1 = scopes;
            for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
              subscope = kobj$1[ki$1];
                subscope['$kindexof'] = 'closure';
                
            }
            scope['$kindexof'] = 'closure';
            
          }
          rv += ("($kindexof.call(" + (this.right.left.js()) + ", " + left_code + ") >= 0) " + (this.right.js(true)));
          
        } else       if (opjs === 'nor') {
          rv += ("!(" + left_code + " || " + (this.right.js()) + ")");
          
        } else       if (opjs === 'pow') {
          rv += ("Math.pow(" + left_code + ", " + (this.right.left.js()) + ") " + (this.right.js(true)));
          
        } else {
          rv += ("" + left_code + " " + opjs + " " + (this.right.js()));
          
        }
      }
      if (((this.op != null) ? this.op.invert : void 0)) {
        rv = ("!(" + rv + ")");
        
      }
      if ((this.conditional != null)) {
    rv = this.conditional.js(rv, true);
      }
      
      return rv;
      
    };
    this.UnaryExpression.prototype.js = function  () {
      var rv, base_val, kw_translate, undefined_unary, existence_qualifiers, last_accessor, ki$1, kobj$1, accessor, existence_check, eq, closeout;
      rv = '';
      
      if (this.base.type === 'IDENTIFIER') {
        base_val = this.base.value;
        
        kw_translate = KEYWORD_TRANSLATE[base_val];
        
        rv += kw_translate || base_val;
        
        if ((kw_translate == null)) {
          if (!((scope[base_val] != null) || (!(this.is_lvalue())) || this.accessors.length > 0)) {
    scope[base_val] = 'closures ok';
          }
          
        }
      } else {
        rv += this.base.js();
  /*an undefined unary is a simple variable access to an undeclared variable
   * it requres we check if the variable exists before checking if it is null/undefined*/
        
      }
      undefined_unary = (this.base.type === 'IDENTIFIER' && (scope[base_val] == null) && (kw_translate == null));
      
      existence_qualifiers = [];
      
      last_accessor = this.accessors[this.accessors.length - 1];
      
      kobj$1 = this.accessors;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        accessor = kobj$1[ki$1];
          existence_qualifiers.push(accessor.js_existence(rv, undefined_unary, last_accessor.invert));
          
          rv += accessor.js();
          
          undefined_unary = false; /*only possible for the first accessor*/
          
      }
      existence_check = [];
      
      kobj$1 = existence_qualifiers;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        eq = kobj$1[ki$1];
          if (eq !== "") {
            existence_check.push(eq);
            
          }
      }
      existence_check = existence_check.join(' && ');
      
      if (existence_check !== "") {
        if (last_accessor instanceof self.ExisentialCheck) {
          rv = ("(" + existence_check + ")");
          
        } else {
          closeout = "void 0";
          
          rv = ("((" + existence_check + ") ? " + rv + " : " + closeout + ")");
          
        }
      }
      if (((this.preop != null) ? this.preop.value : void 0) === 'new') {
        rv = ("" + (KEYWORD_TRANSLATE[this.preop.value]) + " " + rv);
        
      } else     if (((this.preop != null) ? this.preop.value : void 0) === 'not') {
        rv = ("" + (KEYWORD_TRANSLATE[this.preop.value]) + "(" + rv + ")");
        
      } else     if (((this.preop != null) ? this.preop.value : void 0) === '-') {
        rv = ("-" + rv);
        
      }
      return rv;
      
    };
    this.WhenExpression.prototype.js = function  (true_block_js, must_return_value) {
      var conditional_js;
      conditional_js = this.condition.js();
      
      if (this.specifier.value === 'unless' || this.specifier.value === 'except') {
        conditional_js = ("!(" + conditional_js + ")");
        
      }
      if ((this.false_expr != null)) {
        return ("(" + conditional_js + ") ? " + true_block_js + " : " + (this.false_expr.js()));
        
      } else {
        if (must_return_value) {
          return ("(" + conditional_js + ") ? " + true_block_js + " : void 0");
          
        } else {
          return ("if (" + conditional_js + ") {" + true_block_js + "}");
          
        }
      }
      return rv;
      
    };
    this.ExisentialCheck.prototype.js = function  () {
        return "";
      
    };
    this.ExisentialCheck.prototype.js_existence = function  (accessor, undefined_unary, invert) {
        return check_existence_wrapper(accessor, undefined_unary, invert);
      
    };
    this.PropertyAccess.prototype.js = function  () {
      var rv;
      if (this.expr.type === 'IDENTIFIER') {
        rv = this.expr.value;
        
      } else {
        rv = this.expr.js();
        
      }
      rv = ("." + rv);
      
      return rv;
      
    };
    this.PropertyAccess.prototype.js_existence = function  (accessor, undefined_unary, invert) {
        if (this.exisential) {
        return check_existence_wrapper(accessor, undefined_unary, invert);
        
      } else {
        return '';
        
      }
    };
    this.AssignmentStatement.prototype.js = function  () {
      var op, rv;
      op = this.assignOp.value;
      
      if (op !== '=') {
        op += '=';
        
      }
      rv = ("" + (this.lvalue.js()) + " " + op + " " + (this.rvalue.js()) + ";");
      
      if ((this.conditional != null)) {
    rv = this.conditional.js(rv, false);
      }
      
      return rv;
      
    };
    this.NumberConstant.prototype.js = function  () {
        return this.token.text;
      
    };
    this.StringConstant.prototype.js = function  () {
      var rv;
      rv = this.token.value;
      
      return rv;
      
    };
    this.RegexConstant.prototype.js = function  () {
        return this.token.text;
      
    };
    this.BinOp.prototype.js = function  () {
        return KEYWORD_TRANSLATE[this.op.value] || this.op.value;
      
    };
    this.IfStatement.prototype.js = function  () {
      var conditional_js, cb_counter, rv, ki$1, kobj$1, else_clause, inner_js;
      if (!((this.original_callback != null))) {
    this.original_callback = this.callback;
      }
      
      conditional_js = this.conditional.js();
      
      cb_counter = callback_counter;
      
      if (this.condition.value === 'unless' || this.condition.value === 'except') {
        conditional_js = ("!(" + conditional_js + ")");
        
      }
      rv = ("if (" + conditional_js + ") {");
      
      this.block.in_conditional = true;
      
      kobj$1 = this.elses;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        else_clause = kobj$1[ki$1];
          else_clause.block.in_conditional = true;
          
      }
      inner_js = this.js_no_callbacks();
      
      if ((this.callback !== current_callback) && (!(this.is_else_if))) {
        callback_counter = cb_counter;
        
        inner_js = this.js_callbacks();
        
      }
      return rv + inner_js;
      
    };
    this.IfStatement.prototype.js_no_callbacks = function  () {
      var block_js, else_js, ki$1, kobj$1, else_clause;
      this.block.callback = this.callback;
      
      block_js = this.block.js() + this.block.js_closeout() + '}';
      
      else_js = "";
      
      kobj$1 = this.elses;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        else_clause = kobj$1[ki$1];
          else_clause.block.callback = this.callback;
          
          else_clause.block.original_callback = this.original_callback;
          
          else_js += " else ";
          
          if ((else_clause.conditional != null)) {
            else_js += ("if (" + (else_clause.conditional.js()) + ")");
            
          }
          else_js += " {";
          
          else_js += else_clause.block.js() + else_clause.block.js_closeout();
          
          else_js += '}';
          
      }
      return block_js + else_js;
      
    };
    this.IfStatement.prototype.js_callbacks = function  () {
      var block_js, ki$1, kobj$1, else_clause, else_js, callback_js;
      this.callback = create_callback();
      
      this.block.callback = this.callback;
      
      this.block.original_callback = this.callback;
      
      block_js = this.block.js();
      
      kobj$1 = this.elses;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        else_clause = kobj$1[ki$1];
          else_clause.block.callback = this.callback;
          
          else_clause.block.original_callback = this.callback;
          
          else_clause.block_js = " else ";
          
          if ((else_clause.conditional != null)) {
            else_clause.block_js += ("if (" + (else_clause.conditional.js()) + ")");
            
          }
          else_clause.block_js += " {";
          
          else_clause.block_js += else_clause.block.js();
          
      }
      block_js += this.block.js_closeout() + '}';
      
      else_js = "";
      
      kobj$1 = this.elses;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        else_clause = kobj$1[ki$1];
          else_js += else_clause.block_js + else_clause.block.js_closeout() + '}';
          
      }
      callback_js = ("return " + (this.callback) + "();");
      
      callback_js += ("function " + (this.callback) + "() {");
      
      callback_js += render_try_blocks();
      
      this.parent_block.closeout_callback = this.original_callback;
      
      create_callback(); /*generate a new callback for future if statements/for loops*/
      
      return block_js + else_js + callback_js;
      
    };
    this.BlankStatement.prototype.js = function  () {
        return '';
      
    };
    for_depth = 1;
    
    this.ForStatement.prototype.js = function  () {
      var rv, iterator, terminator, loop_block_js;
      this.callback = current_callback;
      
      rv = "";
      
      iterator = ("ki$" + for_depth);
      
      terminator = ("kobj$" + for_depth);
      
      scope[iterator] = 'no closures';
      
      scope[terminator] = 'no closures';
      
      for_depth += 1;
      
      loop_block_js = this.loop_block.js() + this.loop_block.js_closeout();
      
      if (this.callback !== current_callback) { /*something in this loop uses callbacks*/
        if (((this.execution_style != null) ? this.execution_style.value : void 0) === 'parallel') {
          throw "Not Implemented";
          
        } else {
          throw "Not Implemented";
          
        }
      } else {
        if (this.type.value === 'in') { /*normal for loop*/
          rv += ("" + terminator + " = " + (this.iterable.js()) + ";for (" + iterator + " = 0; " + iterator + " < " + terminator + ".length; " + iterator + "++) {");
          
        } else {
          rv += ("" + terminator + " = " + (this.iterable.js()) + ";for (" + (this.iterant.js()) + " in " + terminator + ") {");
          
        }
        if (this.type.value === 'in') {
          rv += ("" + (this.iterant.js()) + " = " + terminator + "[" + iterator + "];");
          
        }
        rv += loop_block_js;
        
        rv += "}";
        
      }
      return rv;
      
    };
    this.WhileStatement.prototype.js = function  () {
      var rv;
      rv = ("while (" + (this.expr.js()) + ") {");
      
      rv += this.block.js() + this.block.js_closeout();
      
      rv += "}";
      
      if (this.callback !== current_callback) {
        throw "Not Implemented";
        
      }
      return rv;
      
    };
    this.Block.prototype.js = function  () {
      var previous_cb, rv, ki$1, kobj$1, statement;
      if (!((this.callback != null))) {
    this.callback = current_callback;
      }
      
      if (!((this.original_callback != null))) {
    this.original_callback = current_callback;
      }
      
      previous_cb = current_callback;
      
      this.callbacks = [];
      
      rv = [];
      
      kobj$1 = this.statements;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        statement = kobj$1[ki$1];
          statement.parent_block = this;
          
          statement.callback = this.callback;
          
          statement.original_callback = this.original_callback;
          
          statement.in_conditional = this.in_conditional;
          
          rv.push(statement.js());
          
          if (current_callback !== previous_cb) {
            this.callbacks.unshift(this.callback);
            
            this.callback = current_callback;
            
            previous_cb = current_callback;
            
          }
      }
      rv = rv.join('\n');
      
      if (this.callbacks.length > 0) {
        if ((scope['k$next'] != null)) {
          rv += "var k$done = (typeof k$next == 'function') ? k$next : function (){}; k$next=function (){}; return k$done();";
          
        }
      }
      return rv;
      
    };
    this.Block.prototype.js_closeout = function  () {
      var rv, ki$1, kobj$1, callback;
      rv = "";
      
      if ((this.closeout_callback != null) && this.callbacks.length !== 0 && this.in_conditional) {
        rv += ("return " + (this.closeout_callback) + "();");
        
      }
      kobj$1 = this.callbacks;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        callback = kobj$1[ki$1];
          rv += render_catch_blocks();
          
          rv += "}";
          
      }
      return rv;
      
    };
    this.ParenExpression.prototype.js = function  () {
        return ("(" + (this.expr.js()) + ")");
      
    };
    this.IndexExpression.prototype.js = function  () {
        return ("[" + (this.expr.js()) + "]");
      
    };
    this.IndexExpression.prototype.js_existence = function  (accessor, undefined_unary, invert) {
        if (this.exisential) {
        return check_existence_wrapper(accessor, undefined_unary, invert);
        
      } else {
        return '';
        
      }
    };
    this.ListExpression.prototype.js = function  () {
      var rv, ki$1, kobj$1, item;
      if ((this.comprehension == null)) {
        rv = [];
        
        kobj$1 = this.items;
        for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
          item = kobj$1[ki$1];
            rv.push(item.js());
            
        }
        rv = rv.join(', ');
        
        return ("[" + rv + "]");
        
      } else {
        return this.comprehension.js();
        
      }
    };
    this.ListComprehension.prototype.js = function  () {
      var rv;
      use_snippets['array list comprehension'] = snippets['array list comprehension'];
      
      scope[this.iterant.value] = 'closures ok';
      
      rv = ("$kcomprl(" + (this.iterable.js()) + ",function($ki){" + (this.iterant.value) + " = $ki;return " + (this.iter_expr.js()) + ";})");
      
      return rv;
      
    };
    this.ObjectComprehension.prototype.js = function  () {
      var rv;
      use_snippets['object list comprehension'] = snippets['object list comprehension'];
      
      rv = "";
      
      if ((this.property_iterant != null)) {
        scope[this.property_iterant.value] = 'closures ok';
        
        rv += ("" + (this.property_iterant.value) + " = $kp;");
        
      }
      if ((this.value_iterant != null)) {
        scope[this.value_iterant.value] = 'closures ok';
        
        rv += ("" + (this.value_iterant.value) + " = $kv;");
        
      }
      rv = ("$kcompro(" + (this.iterable.js()) + ",function($kp,$kv){" + rv + ";return " + (this.iter_expr.js()) + ";})");
      
      return rv;
      
    };
    this.MapItem.prototype.js = function  () {
        return ("" + (this.key.js()) + ": " + (this.val.js()));
      
    };
    this.MapExpression.prototype.js = function  () {
      var rv, ki$1, kobj$1, item;
      rv = [];
      
      kobj$1 = this.items;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        item = kobj$1[ki$1];
          rv.push(item.js());
          
      }
      rv = rv.join(', ');
      
      return ("{ " + rv + " }");
      
    };
    this.FunctionExpression.prototype.js = function  () {
        this.args = [];
      
      if (this.specifier.value === 'task') {
    this.callback = 'k$next';
      }
      
      if (class_defs.length > 0 && (this.name != null)) { /*is a member function/method*/
        if (this.specifier.value === 'method' && this.name.value === 'initialize') {
          class_def.code += this.js_constructor();
          
          return "";
          
        } else {
          return this.js_class_member();
          
        }
      } else {
        return this.js_bare_function();
        
      }
    };
    this.FunctionExpression.prototype.js_bare_function = function  () {
      var rv, ki$1, kobj$1, argument;
      rv = "function ";
      
      if ((this.name != null)) {
        rv += this.name.value;
        
      }
      kobj$1 = this.arguments;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        argument = kobj$1[ki$1];
          this.args.push(argument.name.value);
          
      }
      return rv + this.js_body();
      
    };
    this.FunctionExpression.prototype.js_class_member = function  () {
      var rv, ki$1, kobj$1, argument;
      if (this.specifier.value === 'method') {
        rv = ("" + (class_def.name) + ".prototype." + (this.name.value) + " = function");
        
      } else {
        rv = ("" + (class_def.name) + "." + (this.name.value) + " = function");
        
      }
      kobj$1 = this.arguments;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        argument = kobj$1[ki$1];
          this.args.push(argument.name.value);
          
      }
      return rv + this.js_body();
      
    };
    this.FunctionExpression.prototype.js_constructor = function  () {
      var rv, ki$1, kobj$1, argument;
      class_def.has_constructor = true;
      
      rv = ("function " + (class_def.name));
      
      class_def.args = [];
      
      kobj$1 = this.arguments;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        argument = kobj$1[ki$1];
          class_def.args.push(argument.name.value);
          
      }
      this.args = class_def.args;
      
      rv += this.js_body(class_def.args);
      
      ((this.callback_arg != null)) ? class_def.args.push(this.callback_arg) : void 0;
      
      return rv;
      
    };
    this.FunctionExpression.prototype.js_body = function  () {
      var rv, ki$1, kobj$1, arg_name, block_code;
      rv = "";
      
      push_scope();
      
      if ((this.callback != null)) {
    scope['k$next'] = this.callback;
      }
      
      kobj$1 = this.args;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        arg_name = kobj$1[ki$1];
          scope[arg_name] = 'argument';
          
      }
      block_code = this.block.js(true) + this.block.js_closeout();
      
      if ((this.callback != null)) {
        this.args.push(this.callback);
        
        block_code = "try {" + block_code;
        
      }
      rv += pop_scope(block_code, false);
      
      if ((this.callback != null)) {
        rv += "} catch (k$err) {if (k$next) {return k$next(k$err);} else {throw k$err;}}";
        
        rv += "return k$next ? k$next() : void 0;";
        
      }
      rv += "}";
      
      rv = (" (" + (this.args.join(', ')) + ") {") + rv;
      
      return rv;
      
    };
    this.FunctionCall.prototype.js = function  (as_list) {
      var rv, ki$1, kobj$1, argument;
      rv = [];
      
      kobj$1 = this.arguments;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        argument = kobj$1[ki$1];
          rv.push(argument.js());
          
      }
      ((this.callback_name != null)) ? rv.push(this.callback_name) : void 0;
      
      rv = rv.join(', ');
      
      if (as_list) {
        return ("[" + rv + "]");
        
      } else {
        return ("(" + rv + ")");
        
      }
    };
    this.FunctionCall.prototype.js_existence = function  (accessor, undefined_unary, invert) {
        if (this.exisential) {
        return check_existence_wrapper(accessor, undefined_unary, invert);
        
      } else {
        return '';
        
      }
    };
    this.FunctionCallArgument.prototype.js = function  () {
        return this.val.js();
      
    };
    this.ClassDefinition.prototype.js = function  () {
      var block_code, rv;
      push_scope();
      
      push_class();
      
      class_def.name = this.name.value;
      
      class_def.parent = ((this.parent != null) ? this.parent.value : void 0);
      
      block_code = this.block.js() + this.block.js_closeout();
      
      block_code = pop_scope(block_code, false);
      
      rv = class_def.code;
      
      if (!(class_def.has_constructor)) {
        rv += ("function " + (class_def.name) + " () {");
        
        if ((this.parent != null)) {
          rv += ("return " + (this.parent.value) + ".prototype.constructor.apply(this,arguments);");
          
        }
        rv += "}";
        
      }
      if ((this.parent != null)) {
        rv += ("__extends(" + (this.name.value) + "," + (this.parent.value) + ");");
        
        use_snippets['inherits'] = snippets['inherits'];
        
      }
      rv += block_code;
      
      pop_class();
      
      return rv;
      
    };
    function render_try_blocks () {
      var rv, ki$1, kobj$1, try_block;
      rv = "";
      
      kobj$1 = try_block_stack;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        try_block = kobj$1[ki$1];
          rv += try_block.js_wrapper_try();
          
      }
      return rv;
      
    };
    function render_catch_blocks () {
      var rv, ki$1, kobj$1, try_block;
      rv = "";
      
      kobj$1 = try_block_stack;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        try_block = kobj$1[ki$1];
          rv += try_block.js_wrapper_catch();
          
      }
      return rv;
      
    };
    this.TryCatch.prototype.js = function  () {
      var rv;
      try_block_stack.unshift(this);
      
      this.try_block.in_conditional = true;
      
      if (!((this.original_callback != null))) {
    this.original_callback = this.callback;
      }
      
      rv = this.js_no_callbacks();
      
      if (this.callback !== current_callback) {
        this.callback = create_callback();
        
        this.closeout_callback = this.callback;
        
        rv = this.js_callbacks();
        
      }
      return rv;
      
    };
    this.TryCatch.prototype.js_no_callbacks = function  () {
      var rv;
      rv = this.js_wrapper_try();
      
      this.try_block.original_callback = this.original_callback;
      
      rv += this.try_block.js() + this.try_block.js_closeout();
      
      rv += this.js_wrapper_catch();
      
      try_block_stack.shift();
      
      return rv;
      
    };
    this.TryCatch.prototype.js_callbacks = function  () {
      var rv;
      rv = this.js_wrapper_try();
      
      this.try_block.original_callback = this.original_callback;
      
      rv += this.try_block.js() + this.try_block.js_closeout();
      
      rv += this.js_wrapper_catch();
      
      rv += ("function " + (this.callback) + "() {");
      
      try_block_stack.shift();
      
      rv += render_try_blocks();
      
      this.parent_block.closeout_callback = this.original_callback;
      
      return rv;
      
    };
    this.TryCatch.prototype.js_wrapper_try = function  () {
      var rv;
      rv = "try {";
      
      return rv;
      
    };
    this.TryCatch.prototype.js_wrapper_catch = function  () {
      var rv;
      rv = "}";
      
      if ((this.catch_block != null)) {
        rv += (" catch (" + (this.identifier.value) + ") {");
        
        rv += this.catch_block.js() + this.catch_block.js_closeout();
        
      } else {
        rv += " catch (k$e) {";
        
      }
      rv += '}';
      
      if ((this.closeout_callback != null)) {
        rv += ("return " + (this.closeout_callback) + "();");
        
      }
      return rv;
      
    };
    this.SuperStatement.prototype.js = function  () {
      var rv;
      if ((class_def.parent == null)) {
    return "";
      }
      
      rv = ("" + (class_def.parent) + ".prototype.constructor.apply(this,");
      
      if ((this.accessor != null)) {
        rv += this.accessor.js(true);
        
      } else {
        rv += "arguments";
        
      }
      rv += ");";
      
      return rv;
      
    };
    this.WaitForStatement.prototype.js = function  () {
      var rv, rv_block, arg_i, ki$1, kobj$1, argument;
      this.new_callback = create_callback();
      
      this.rvalue.callback_args = this.lvalue;
      
      this.rvalue.accessors[this.rvalue.accessors.length - 1].callback_name = this.new_callback;
      
      rv = ("return " + (this.rvalue.js()) + ";");
      
      rv_block = "";
      
      arg_i = 1;
      
      kobj$1 = this.lvalue.arguments;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        argument = kobj$1[ki$1];
          rv_block += ("" + (argument.base.value) + " = arguments[" + arg_i + "];");
          
          if (!((scope[argument.base.value] != null))) {
    scope[argument.base.value] = 'closures ok';
          }
          
          arg_i += 1;
          
      }
      rv_block += this.block.js();
      
      if ((this.conditional != null)) { /*TODO support this for wait fors*/
    rv = this.conditional.js(rv, false);
      }
      
      rv += ("function " + (this.new_callback) + " () {");
      
      rv += render_try_blocks();
      
      rv += "if (arguments[0] != null) throw arguments[0];";
      
      rv += rv_block;
      
      if (this.in_conditional) {
        rv += ("return " + (this.parent_block.callback) + "();");
        
      } else     if (scope['k$next']) {
        rv += "return k$next ? k$next() : void 0;";
        
      }
      rv += this.block.js_closeout();
      
      return rv;
      
    };
    snippets = { 'in': 'var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };', 'inherits': 'var __hasProp = {}.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }', 'array list comprehension': 'var $kcomprl = function (iterable,func) {var o = []; if (iterable instanceof Array) {for (var i=0;i<iterable.length;i++) {o.push(func(iterable[i]));}} else if (typeof(iterable.next) == "function") {var i; while ((i = iterable.next()) != null) {o.push(func(i));}} else {throw "Object is not iterable";}return o;};', 'object list comprehension': 'var $kcompro = function (obj,func) {var o = []; for (var k in obj) {o.push(func(k,obj[k]));}return o;}' };
    
    
  };
})()
