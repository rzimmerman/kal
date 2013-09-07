// simulate enough of node.js's require to get Kal loaded
var __requireCache = {};
var __moduleStack = [];
var module = window;
var exports = {};
var require = function (moduleName) {
  if (__requireCache[moduleName] != null) return __requireCache[moduleName];
  __requireCache[moduleName] = {}; // same way node handles circular dependencies
  __moduleStack.push(module);
  module = {exports:{}};
  exports = module.exports;
  // if running on localhost (out of the git repo), the source .js files will be
  // in the ../compiled directory. When we host this online we'll put
  // the kal source in our ./scripts directory
  var urlBase = 'compiled/'
  var request = new XMLHttpRequest;
  request.open('GET', urlBase + moduleName + '.js', false); //synchronous request
  request.send(null);
  if (request.status === 200) {
    eval.apply(window, [request.responseText]);
  }
  var rv = module.exports;
  module = __moduleStack.pop();
  exports = module.exports;
  __requireCache[moduleName] = rv;
  return rv;
}
var kal = require('kal');
var recompile = function (run) {
  var in_kal = document.getElementById('kal_source').value;
  var out_js;
  try {
    // try to compile
    out_js = kal.compile(in_kal, {bare:false}).replace(/^\s+|\s+$/g, ''); //trim the string
    document.getElementById('js_results').innerText = out_js;
    // if successfuly clear the error field
    document.getElementById('error_text').innerText = '';
    if (run) eval.apply(window,[out_js]);
  } catch (e) {
    // syntax errors wind up here
    document.getElementById('error_text').innerText = 'Syntax Error: ' + e;
  }
}

var link = function () {
  var in_kal = document.getElementById('kal_source').value;
  window.location.hash = "#kal:" + encodeURI(in_kal);
}

function focusInput() {
  var kal_source = document.getElementById('kal_source');
  if (window.location.hash.match(/^#kal:/g)) {
    kal_source.value = decodeURI(window.location.hash.slice(5));
    recompile();
  }
  kal_source.focus();
  kal_source.selectionStart = kal_source.selectionEnd = kal_source.value.length;
}
