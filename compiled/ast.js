  (function () {
    var $kindexof = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  function ParseFailed (message) {
        this.message = message;
      
      
    }  
  function SyntaxError (message) {
        this.message = message;
      
      this.locked = true;
      
      
    }  
  exports.SyntaxError = SyntaxError;
  function ASTBase (ts) {
        this.locked = false;
      
      this.ts = ts;
      
      this.line = ts.line;
      
      /*    
    #optionally match one of the classes or tokens in the list*/
      this.parse();
      
    }    
    ASTBase.prototype.opt = function () {
        var rv, start_index, ki$1, kobj$1, cls;
      rv = null;
      
      start_index = this.ts.index;
      
      kobj$1 = arguments;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        cls = kobj$1[ki$1];
          if (typeof(cls) === 'string') {
            if (this.ts.type === cls) {
              rv = this.ts.current;
              
              this.ts.next();
              
              return rv;
              
            }
          } else {
            try {
                rv = new  cls(this.ts);
                
                return rv;
                          } catch (e) {
                this.ts.goto_token(start_index);
                
                if (e.locked) {
                  throw e;
                  
                }}
            }
        }
        /*  
    #require match to one of the classes or tokens in the list*/
        return null;
        
      };
      ASTBase.prototype.req = function () {
        var rv, list, ki$1, kobj$1, cls, message;
        rv = this.opt.apply(this, arguments);
        
        if ((rv != null)) {
    return rv;
        }
        
        list = [];
        
        kobj$1 = arguments;
        for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
          cls = kobj$1[ki$1];
            list.push(cls.name || cls);
            
        }
        if (list.length === 1) {
          message = ("Expected " + (list[0]));
          
        } else {
          message = ("Expected one of " + (list.join(', ')));
          
        }
        this.error("" + message);
        
      };
      
      /*equire token val*/
      ASTBase.prototype.opt_val = function () {
        var rv;
        if (($kindexof.call(arguments, this.ts.value) >= 0) ) {
          rv = this.ts.current;
          
          this.ts.next();
          
          return rv;
          
        } else {
          return null;
          
          
        }
      };
      ASTBase.prototype.req_val = function () {
        var rv, args, ki$1, kobj$1, v;
        rv = this.opt_val.apply(this, arguments);
        
        if ((rv != null)) {
    return rv;
        }
        
        args = [];
        
        kobj$1 = arguments;
        for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
          v = kobj$1[ki$1];
            args.push(v);
            
        }
        this.error("Expected '" + (args.join(' or ')) + "'");
        
      };
      
      /*equire at least o*/
      ASTBase.prototype.req_multi = function () {
        var rv, list, ki$1, kobj$1, cls;
        rv = this.opt_multi.apply(this, arguments);
        
        if (rv.length > 0) {
    return rv;
        }
        
        
        list = [];
        
        kobj$1 = arguments;
        for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
          cls = kobj$1[ki$1];
            list.push(cls.name || cls);
            
        }
        this.error("Expected one of " + (list.join(', ')));
        
      };
      
      /*ptionally have multip*/
      ASTBase.prototype.opt_multi = function () {
        var cls, rv;
        cls = this.opt.apply(this, arguments);
        
        if (!((cls != null))) {
    return [];
        }
        
        rv = [cls];
        
        while ((cls != null)) {
            cls = this.opt.apply(this, arguments);
            
            ((cls != null)) ? rv.push(cls) : void 0;
            
        }
        return rv;
        
      };
      
      ASTBase.prototype.parse = function () {
            this.error('Parser Not Implemented: ' + this.constructor.name);
        
        
      };
      ASTBase.prototype.js = function () {
            this.error('Javascript Generator Not Implemented: ' + this.constructor.name);
        
        
      };
      ASTBase.prototype.error = function (msg) {
        var full_msg;
        full_msg = msg + ' on line ' + this.line;
        
        if (this.locked) {
          throw new  SyntaxError(full_msg);
          
        } else {
          throw new  ParseFailed(full_msg);
          
        }
        
      };
      ASTBase.prototype.lock = function () {
            this.locked = true;
        
        this.line = this.ts.line;
        
      };
      
    exports.ASTBase = ASTBase;
  })()
