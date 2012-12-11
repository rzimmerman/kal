(function () {
  var KEYWORD_TRANSLATE, load;
  var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  KEYWORD_TRANSLATE = { 'yes': 'true', 'on': 'true', 'no': 'false', 'off': 'false', 'is': '===', 'isnt': '!==', '==': '===', '!=': '!==', 'and': '&&', 'but': '&&', 'or': '||', 'xor': '^', '^': 'pow', 'not': '!', 'new': 'new ', 'me': 'this', 'this': 'this', 'null': 'null', 'nothing': 'null', 'none': 'null', 'break': 'break', 'throw': 'throw', 'raise': 'throw', 'instanceof': 'instanceof', 'of': 'in', 'EndOfList': 'undefined', 'fail': 'throw' };
  load = function load (grammar) {
    apply_generator_to_grammar.apply(grammar);
    
  };
  exports.load = load;
  function apply_generator_to_grammar () {
    var i, scopes, scope, use_callback, use_callbacks, callback_count, trigger_callbacks, trigger_callback, in_branch_or_loop, in_branch_or_loops, class_defs, class_def, use_snippets, self, for_depth, snippets;
    i = '';
    
    function indent () {
        i += '  ';
      
    };
    function dedent () {
        i = i.slice(0, 0 - 2);
      
    };
    scopes = [];
    
    scope = {  };
    
    use_callback = null;
    
    use_callbacks = [];
    
    callback_count = 1;
    
    trigger_callbacks = [];
    
    trigger_callback = false;
    
    in_branch_or_loop = false;
    
    in_branch_or_loops = [];
    
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
      
      trigger_callbacks.push(trigger_callback);
      
      trigger_callback = false;
      
      in_branch_or_loops.push(in_branch_or_loop);
      
      in_branch_or_loop = false;
      
      new_scope = {  };
      
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
      rv = i;
      
      var_names = [];
  /*callbacks = callback_scopes.pop()
   * use_callback = use_callbacks.pop()*/
      
      trigger_callback = trigger_callbacks.pop();
      
      in_branch_or_loop = in_branch_or_loops.pop();
      
      kobj$1 = scope;
  for (var_name in kobj$1) {
          if (!((($kindexof.call(['closure', 'argument', 'function', 'class definition'], scope[var_name]) >= 0) ))) {
            var_names.push(var_name);
            
          }
      }
      if (wrap) {
        rv += '(function () {\n';
        
        indent();
        
        code = i + code.replace(/\n/g, '\n  ');
        
      }
      if (var_names.length > 0) {
        rv += '  var ' + var_names.join(', ') + ';\n';
        
      }
      rv += code;
      
      if (wrap) {
        dedent();
        
        rv += ("\n" + i + "})()\n");
        
      }
      if (scopes !== []) {
        scope = scopes.pop();
        
      }
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
      var code, ki$1, kobj$1, statement, snip, key, rv, comment;
      i = '';
      
      scopes = [];
      
      scope = {  };
      
      trigger_callbacks = [];
      
      trigger_callback = false;
      
      use_callbacks = [];
      
      use_callback = null;
      
      callback_count = 1;
      
      in_branch_or_loop = false;
      
      in_branch_or_loops = [];
      
      class_defs = [];
      
      class_def = { name: '', code: '', args: [], has_constructor: false };
      
      use_snippets = {  };
      
      code = [];
      
      kobj$1 = this.statements;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        statement = kobj$1[ki$1];
          if (!((statement.statement instanceof self.BlankStatement))) {
            code.push(statement.js());
            
          }
      }
      code = code.join('\n');
      
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
              rv += i + '/*' + comment.value + '*/\n';
              
            }
          }
      }
      rv += i + this.statement.js();
      
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
      rv = ("throw " + (this.expr.js()) + ";");
      
      if ((this.conditional != null)) {
    rv = this.conditional.js(rv, false);
      }
      
      return rv;
      
    };
    this.ReturnStatement.prototype.js = function  () {
      var rv, exprs_js, ki$1, kobj$1, expr;
      rv = "return";
      
      if ((use_callback != null)) {
        rv += (in_branch_or_loop) ? (" " + use_callback + "(null,") : " $knext(null,";
        
      }
      if (this.exprs.length > 0 && (use_callback == null)) {
    rv += " ";
      }
      
      if (this.exprs.length > 1) {
        exprs_js = [];
        
        kobj$1 = this.exprs;
        for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
          expr = kobj$1[ki$1];
            exprs_js.push(expr.js());
            
        }
        rv += (!((use_callback != null))) ? ("[" + (exprs_js.join(', ')) + "]") : ("" + (exprs_js.join(', ')));
        
      } else     if (this.exprs.length === 1) {
        rv += ("" + (this.exprs[0].js()));
        
      }
      if ((use_callback != null)) {
    rv += ")";
      }
      
      rv += ";";
      
      if ((this.conditional != null)) {
    rv = this.conditional.js(rv, false);
      }
      
      return rv;
      
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
      var conditional_js, indented_js;
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
          indented_js = '  ' + true_block_js.replace(/\n/g, '\n  ');
          
          return ("if (" + conditional_js + ") {\n" + indented_js + "\n" + i + "}");
          
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
    this.IfStatement.prototype.js = function  (dont_callback) {
      var conditional_js, rv;
      use_callbacks.push(use_callback);
      
      in_branch_or_loops.push(in_branch_or_loop);
      
      in_branch_or_loop = true;
      
      conditional_js = this.conditional.js();
      
      if (this.condition.value === 'unless' || this.condition.value === 'except') {
        conditional_js = ("!(" + conditional_js + ")");
        
      }
      rv = ("if (" + conditional_js + ") {\n" + (this.true_block.js()) + "\n" + i + "}");
      
      if ((this.else_block != null)) {
        rv += this.else_block.js();
        
      }
      if ((use_callback != null)) {
    trigger_callback = true;
      }
      
      if ((use_callback != null) && !(dont_callback)) {
    rv += ("\n" + i + "return " + use_callback + "(null);");
      }
      
      use_callbacks.pop();
      
      in_branch_or_loop = in_branch_or_loops.pop();
      
      return rv;
      
    };
    this.ElseStatement.prototype.js = function  () {
        if (this.false_block instanceof self.Statement && (this.false_block.statement instanceof self.IfStatement)) {
        return (" else " + (this.false_block.statement.js(true)));
        
      } else {
        return (" else {\n" + (this.false_block.js()) + "\n" + i + "}");
        
      }
    };
    this.BlankStatement.prototype.js = function  () {
        return '';
      
    };
    for_depth = 1;
    
    this.ForStatement.prototype.js = function  () {
      var iterator, terminator, rv;
      iterator = ("ki$" + for_depth);
      
      terminator = ("kobj$" + for_depth);
      
      scope[iterator] = 'no closures';
      
      scope[terminator] = 'no closures';
      
      if (this.type.value === 'in') {
        rv = ("" + terminator + " = " + (this.iterable.js()) + ";\n" + i + "for (" + iterator + " = 0; " + iterator + " < " + terminator + ".length; " + iterator + "++) {\n");
        
      } else {
        rv = ("" + terminator + " = " + (this.iterable.js()) + ";\nfor (" + (this.iterant.js()) + " in " + terminator + ") {\n");
        
      }
      indent();
      
      for_depth += 1;
      
      if (this.type.value === 'in') {
        rv += ("" + i + "" + (this.iterant.js()) + " = " + terminator + "[" + iterator + "];\n");
        
      }
      rv += this.loop_block.js();
      
      for_depth -= 1;
      
      dedent();
      
      rv += ("\n" + i + "}");
      
      return rv;
      
    };
    this.WhileStatement.prototype.js = function  () {
      var rv;
      rv = ("while (" + (this.expr.js()) + ") {\n");
      
      indent();
      
      rv += this.block.js();
      
      dedent();
      
      rv += ("\n" + i + "}");
      
      return rv;
      
    };
    this.Block.prototype.js = function  (closeout_callbacks) {
      var rv, block_cb_count, ki$1, kobj$1, statement;
      indent();
      
      rv = [];
      
      block_cb_count = 0;
      
      kobj$1 = this.statements;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        statement = kobj$1[ki$1];
          rv.push(statement.js());
          
          if (trigger_callback) {
            trigger_callback = false;
            
            rv.push("" + i + "function " + use_callback + " ($kerr) {\n" + i + "if ($kerr) {throw $kerr;}\n");
            
            indent();
            
            block_cb_count += 1;
            
          }
      }
      while (block_cb_count > 0) {
          dedent();
          
          rv.push("" + i + "}");
          
          block_cb_count -= 1;
          
      }
      rv = rv.join('\n');
      
      dedent();
      
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
      var rv, args, ki$1, kobj$1, argument;
      rv = "function ";
      
      if ((this.name != null)) {
        rv += this.name.value;
        
      }
      args = [];
      
      kobj$1 = this.arguments;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        argument = kobj$1[ki$1];
          args.push(argument.name.value);
          
      }
      (this.use_callback) ? args.push('$knext') : void 0;
      
      return rv + this.js_body(args);
      
    };
    this.FunctionExpression.prototype.js_class_member = function  () {
      var rv, args, ki$1, kobj$1, argument;
      if (this.specifier.value === 'method') {
        rv = ("" + (class_def.name) + ".prototype." + (this.name.value) + " = function");
        
      } else {
        rv = ("" + (class_def.name) + "." + (this.name.value) + " = function");
        
      }
      args = [];
      
      kobj$1 = this.arguments;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        argument = kobj$1[ki$1];
          args.push(argument.name.value);
          
      }
      return rv + this.js_body(args);
      
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
      rv += this.js_body(class_def.args);
      
      return rv;
      
    };
    this.FunctionExpression.prototype.js_body = function  (arg_names) {
      var rv, ki$1, kobj$1, arg_name, block_code;
      rv = (" (" + (arg_names.join(', ')) + ") {\n");
      
      push_scope();
      
      if (this.use_callback) {
        if (trigger_callback === false) {
          use_callback = ("$kcb" + callback_count);
          
          callback_count += 1;
          
        }
        rv += ("" + i + "try {\n");
        
      }
      kobj$1 = arg_names;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        arg_name = kobj$1[ki$1];
          scope[arg_name] = 'argument';
          
      }
      block_code = this.block.js(true);
      
      rv += pop_scope(block_code, false);
      
      if (this.use_callback) {
        rv += ("\n" + i + "} catch (e) {if ($knext) {return $knext(e);} else {throw e;}}");
        
        rv += ("\n" + i + "return $knext ? $knext(null) : void 0;");
        
      }
      rv += ("\n" + i + "}");
      
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
      rv = rv.join(', ');
      
      if (as_list) {
        return ("[" + rv + "]");
        
      } else     if (this.with_callback) {
        return (rv !== "") ? (("(" + rv + ", ")) : ("(");
        
      } else {
        return (("(" + rv + ")"));
        
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
      
      block_code = this.block.js();
      
      block_code = pop_scope(block_code, false);
      
      rv = class_def.code;
      
      if (!(class_def.has_constructor)) {
        rv += ("function " + (class_def.name) + " () {");
        
        if ((this.parent != null)) {
          rv += ("\n" + i + "  return " + (this.parent.value) + ".prototype.constructor.apply(this,arguments);\n");
          
        }
        rv += "}";
        
      }
      if ((this.parent != null)) {
        rv += ("" + i + "__extends(" + (this.name.value) + "," + (this.parent.value) + ");\n");
        
        use_snippets['inherits'] = snippets['inherits'];
        
      }
      rv += block_code;
      
      pop_class();
      
      return rv;
      
    };
    this.TryCatch.prototype.js = function  () {
      var rv;
      rv = "try {\n";
      
      indent();
      
      rv += this.try_block.js();
      
      dedent();
      
      rv += ("" + i + "}");
      
      if ((this.catch_block != null)) {
        rv += (" catch (" + (this.identifier.value) + ") {\n");
        
        indent();
        
        rv += this.catch_block.js();
        
        rv += "}";
        
      } else {
        rv += "catch (k$e) {}";
        
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
      var rv, rv_block, arg_i, callback_args, ki$1, kobj$1, argument;
      if ((use_callback == null)) {
        use_callback = ("$kcb" + callback_count);
        
        callback_count += 1;
        
      }
      this.rvalue.callback_args = this.lvalue;
      
      this.rvalue.accessors[this.rvalue.accessors.length - 1].with_callback = true;
      
      rv = "return " + this.rvalue.js();
      
      rv_block = "";
      
      arg_i = 1;
      
      callback_args = ['$kerr'];
      
      kobj$1 = this.lvalue.arguments;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        argument = kobj$1[ki$1];
          callback_args.push("$karg" + arg_i);
          
          rv_block += ("" + i + "" + (argument.base.value) + " = $karg" + arg_i + ";\n");
          
          if (!((scope[argument.base.value] != null))) {
    scope[argument.base.value] = 'closures ok';
          }
          
          arg_i += 1; /*push_scope()*/
          
      }
      rv_block += this.block.js();
      
      callback_args.push('$knext');
      
      rv += ("function (" + (callback_args.join(',')) + ") {\n");
      
      indent();
      
      rv += ("" + i + "try {if ($kerr) {throw $kerr;}\n");
      
      rv += rv_block;
      
      if (in_branch_or_loop) {
        rv += ("" + i + "} catch (e) {return " + use_callback + "(e);}\n");
        
        rv += ("" + i + "return " + use_callback + "();\n");
        
      } else {
        rv += ("" + i + "} catch (e) {if ($knext) {return $knext(e);} else {throw e;}}\n");
        
        rv += ("" + i + "return $knext ? $knext(null) : void 0;\n");
        
      }
      dedent();
      
      rv += ("" + i + "});");
      
      if ((this.conditional != null)) {
    rv = this.conditional.js(rv, false);
      }
      
      return rv;
      
    };
    snippets = { 'in': 'var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };', 'inherits': 'var __hasProp = {}.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }', 'array list comprehension': 'var $kcomprl = function (iterable,func) {var o = []; if (iterable instanceof Array) {for (var i=0;i<iterable.length;i++) {o.push(func(iterable[i]));}} else if (typeof(iterable.next) == "function") {var i; while ((i = iterable.next()) != null) {o.push(func(i));}} else {throw "Object is not iterable";}return o;};', 'object list comprehension': 'var $kcompro = function (obj,func) {var o = []; for (var k in obj) {o.push(func(k,obj[k]));}return o;}' };
    
    
  };
})()
