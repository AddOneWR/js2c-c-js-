// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({11:[function(require,module,exports) {
// 按值删除数组中元素
Array.prototype.removeByVal = function (val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

// 按值删除数组中最后一个匹配的元素
Array.prototype.removeByLastVal = function (val) {
  var index = this.lastIndexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

// 按值删除数组对象中最后一个匹配的元素
Array.prototype.removeByLastValObj = function (val) {
  var index = -1;
  for (var i = 0; i < this.length; i++) {
    if (this[i].value === val) index = i;
  }
  if (index > -1) {
    this.splice(index, 1);
  }
};

// 按索引删除数组中元素
Array.prototype.removeByIndex = function (index) {
  this.splice(index, 1);
};

// 全部替换
String.prototype.replaceAll = function (f, e) {
  var reg = new RegExp(f, "g");
  return this.replace(reg, e);
};

String.prototype.removeStrByIndex = function (start, end) {
  var firstStr = this.slice(0, start);
  var lastStr = this.slice(end + 1);
  return firstStr + lastStr;
};

var util = {
  logg: function logg(content) {
    console.log('--------------------------------------------\n');
    console.log(content);
    console.log();
    console.log('--------------------------------------------\n');
  },

  errLogg: function errLogg(func, content) {
    console.log("-------------error------------\n");
    console.error(func + ': ' + content);
    console.log();
    console.log('-------------error------------\n');
  }
};

module.exports = util;
},{}],13:[function(require,module,exports) {
var NOTFUNC = /^(if|else|else if|for|while)[\s]*$/;
var BASEFUNC = /^(print|printf)[\s]*$/;
var shorChar = ['c', 'i', 's', 'l', 'd', 'f', 'b'];

var common = {
  isState: function isState(char, current, input) {

    var str = input.slice(current, current + 7);

    if (str.indexOf("char") != -1 || str.indexOf("int") != -1 || str.indexOf("short") != -1 || str.indexOf("long") != -1 || str.indexOf("double") != -1 || str.indexOf("float") != -1 || str.indexOf("string") != -1 || str.indexOf("bool") != -1) {
      if (!shorChar.includes(char)) {
        return false;
      }
      if (str.indexOf(' ') === -1) {
        return false;
      }
      return true;
    }

    str = input.slice(current, current + 10);
    if (str.indexOf("long long") != -1 || str.indexOf("long double") != -1) {
      if (char != 'l') {
        return false;
      }
      if (str.indexOf(' ') === -1) {
        return false;
      }
      return true;
    }

    return false;
  },

  isNotFunc: function isNotFunc(name) {
    if (NOTFUNC.test(name)) {
      return true;
    }

    // 是函数
    return false;
  },

  isBaseFunc: function isBaseFunc(name) {
    if (BASEFUNC.test(name)) {
      return name;
    }

    return false;
  },

  isExistFunc: function isExistFunc(name) {
    if (name.includes('=')) {
      return true;
    }

    return false;
  }
};

module.exports = common;
},{}],15:[function(require,module,exports) {
var FUNC_NAME_MAP = {
  'printf': 'console.log'
};

module.exports = FUNC_NAME_MAP;
},{}],17:[function(require,module,exports) {
var FUNC_HANDLE_MAP = {
  printf: function printf(arg) {
    var lastQuoIndex = arg.lastIndexOf('"');
    var paramStr = '';

    // 获取后面参数，+2跳过引号和逗号, 最后再去掉空格
    var argStr = arg.slice(lastQuoIndex + 2, arg.length).replaceAll(' ', '');

    // 获取参数数组
    var argArr = argStr.split(',');

    var percentage = arg.indexOf('%');

    // 起始为1跳过引号
    var argIndex = 0;

    if (percentage === -1) {
      // 没有参数则直接返回字符串
      paramStr = arg;
    } else {
      while (percentage != -1) {
        // 用加号拼接str和参数
        paramStr += '\'' + arg.slice(1, percentage) + '\' + ' + argArr[argIndex];

        // 将之前的字符串截取出去
        arg = arg.slice(percentage + 1, arg.length);

        // 获取下一个占位符
        percentage = arg.indexOf('%');

        // 参数数组自增
        argIndex++;

        if (percentage != -1) {
          paramStr += ' + ';
        }
      }
    }

    return paramStr;
  }
};

module.exports = FUNC_HANDLE_MAP;
},{}],9:[function(require,module,exports) {
var util = require('./util');
var common = require('./common');
var FUNC_NAME_MAP = require('./func-name-map');
var FUNC_HANDLE_MAP = require('./func-handle-map');

var input = '\n#include "stdlib.h"\n\nint add(a,b){\n  int sum = a + b;\n  return sum;\n};\nint main() {\n  string str = "hello world";\n  int a = 3, b = 1;\n  int res = add(a, b);\n  if( res > a ) {\n    printf("the result is %d", res);\n  } else {\n    printf("%s", str);\n  };\n  return 0;\n}';

var WHITESPACE = /\s/;
var WORD = /[a-z0-9 | :~,'"%=+/\-*/^></\[/\]!.&]/i;
var NEWLINE = '\n';

var isParWord = false; // 是否为出现在字符串中的括号， 若存在则不单独匹配成一个括号

// 字符串转token
function tokenizer(input) {
  // 字符串当前位置
  var current = 0;

  // 存放token
  var tokens = [];

  // 循环输入的字符串
  while (current < input.length) {

    // 获取当前字符
    var char = input[current];

    // 检查是否为声明
    if (common.isState(char, current, input)) {
      // 获取声明后空格索引
      var temp_index = input.slice(current, current + 10).indexOf(' ');
      // 获取声明

      current = current + temp_index + 1;

      tokens.push({
        type: 'state',
        value: 'var'
      });

      continue;
    }
    // 检查是否为括号
    if (char === '(') {
      isParWord = true; // 在括号中

      // token添加
      tokens.push({
        type: 'paren',
        value: '('
      });
      // 继续循环
      current++;
      continue;
    }

    if (char === ')') {
      isParWord = false; // 括号结束

      tokens.push({
        type: 'paren',
        value: ')'
      });
      current++;
      continue;
    }

    // 检查是否为大括号
    if (char === '{') {
      tokens.push({
        type: 'parenb',
        value: '{'
      });
      current++;
      continue;
    }

    if (char === '}') {
      tokens.push({
        type: 'parenb',
        value: '}'
      });
      current++;
      continue;
    }

    // 检查是否为分号
    if (char === ';') {
      tokens.push({
        type: 'semicolon',
        value: ';'
      });
      current++;
      continue;
    }

    // 检查是否为换行
    if (char === NEWLINE) {
      tokens.push({
        type: 'newline',
        value: '\n'
      });
    }

    // 检查是否为空格
    if (WHITESPACE.test(char)) {
      tokens.push({
        type: 'whitespace',
        value: ' '
      });
      current++;
      continue;
    }

    // 检查是否为字符
    if (WORD.test(char)) {
      var word_str = '';

      // 直到遇到非字符，如果为字符串中的左括号或者右括号也加入字符串中
      // 左括号通过之前的起始(来判断是否在字符串中
      // 右括号通过判断其后面是否有'来确认是否为终结括号
      while (WORD.test(char) && char || char === '(' && isParWord || char === ')' && input[current + 1] === "'") {
        word_str += char;
        char = input[++current];
      }

      tokens.push({
        type: 'string',
        value: word_str
      });

      continue;
    }

    // 检查是否为库声明
    if (char === '#') {
      while (char != '\n') {
        char = input[++current];
      }

      continue;
    }

    current++;
  }

  return tokens;
}

var isArr = false;

// tokens转ast
function parser(tokens) {
  var current = 0;

  var temp_ast = void 0;
  // 递归遍历
  function getAst() {
    // 遍历token数组

    var token = tokens[current];

    // 判断是否为string类型
    if (token.type === 'string') {
      current++;

      // 判断后面是否为函数
      var next_token = tokens[current];
      if (next_token && next_token.type === 'paren' && next_token.value === '(') {
        return null;
      }

      // 是否为数组声明

      // 是否为初始赋值的数组
      var isAssignArr = next_token && next_token.type === 'parenb' && next_token.value === '{' && tokens[current - 1].value.search('=') != -1;

      // 是否为为赋值数组

      var notAssignArr = tokens[current - 2] && tokens[current - 2].type === 'state' && tokens[current - 1].value.indexOf('[') != -1 && tokens[current - 1].value.indexOf(']') != -1;
      if (isAssignArr || notAssignArr) {
        var curValue = tokens[current - 1].value;
        var arrValue = curValue.removeStrByIndex(curValue.indexOf('['), curValue.indexOf(']'));

        tokens[current - 1].value = arrValue;
        console.log(arrValue);
      }
      // 否则返回string
      return {
        type: 'StringLiteral',
        value: token.value
      };
    }

    if (token.type === 'semicolon') {
      current++;

      return {
        type: 'SemLiteral',
        value: token.value
      };
    }

    if (token.type === 'whitespace') {
      current++;

      return {
        type: 'WhiteLiteral',
        value: token.value
      };
    }

    if (token.type === 'newline') {
      current++;

      return {
        type: 'LineLiteral',
        value: token.value
      };
    }

    // 判断是否为类型声明
    if (token.type === 'state') {
      current++;

      return {
        type: 'StateLiteral',
        value: token.value
      };
    }

    // 判断是否为大括号 其中判断是否为数组声明
    if (token.type === 'parenb' && (token.value === '{' || token.value === '}')) {
      var value = token.value;
      if (tokens[current - 1].type === 'string' && tokens[current - 1].value.search('=') != -1 || isArr) {
        isArr = true;
        if (token.value === '{') {
          value = '[';
        } else if (token.value === '}') {
          value = ']';
          isArr = false;
        }
      }

      current++;

      return {
        type: 'ParenbLiteral',
        value: value
      };
    }

    // 判断是否为括号
    if (token.type === 'paren' && token.value === '(') {
      // 创建CallExpression节点
      var node = {
        type: 'CallExpression',
        params: [],
        name: '',
        isFunc: true,
        isBaseFunc: true,
        isExistFunc: false

        // 获取函数名
      };var pre_index = current - 1;
      var pre_token = tokens[pre_index];

      if (pre_token.type === 'string') {
        node.name = pre_token.value;

        // 判断是否为函数
        var isNotFunc = common.isNotFunc(node.name);

        if (isNotFunc) {
          node.isFunc = false;
        } else {
          // 判断是否为基本函数
          var isBaseFunc = common.isBaseFunc(node.name);

          if (!isBaseFunc) {
            ast.body.removeByLastValObj('var');
            node.isBaseFunc = false;
          }

          // 判断是否为已有函数
          var isExistFunc = common.isExistFunc(node.name);
          if (isExistFunc) {
            node.isExistFunc = true;
          }
        }
      }

      // 删除函数前面的state声明

      // 跳过括号并且获取下一个token
      token = tokens[++current];

      var tempAst = void 0; // 暂存参数

      // 继续遍历直到遇到右括号
      while (token.type !== 'paren' || token.type === 'paren' && token.value !== ')') {
        // 参数放入params
        tempAst = getAst();
        if (tempAst.type === 'StateLiteral') continue;

        node.params.push(tempAst);

        token = tokens[current];

        if (!token) {
          util.errLogg('parser过程出错', '\u5B58\u5728\u62EC\u53F7\u672A\u95ED\u5408\u9519\u8BEF<' + current + '>');
          break;
        }
      }
      // 跳过右括号
      current++;
      return node;
    }

    util.errLogg('parser过程出错', '\u53D1\u73B0\u672A\u77E5\u7C7B\u578B' + token.type);

    current++;
    return;
  }

  // 创建ast
  var ast = {
    type: 'Program',
    body: []
  };

  while (current < tokens.length) {
    temp_ast = getAst();
    if (temp_ast) ast.body.push(temp_ast);
  }

  return ast;
}

// 遍历ast处理节点
function astTraver(ast, visitor) {

  function nodeArrTraver(arr, parent) {
    arr.forEach(function (child) {
      nodeTraver(child, parent);
    });
  }

  function nodeTraver(node, parent) {

    if (!node) {
      util.errLogg('astTraver过程出错', '\u62EC\u53F7\u672A\u95ED\u5408\u6216\u51FA\u73B0\u672A\u77E5\u7C7B\u578B<' + parent.type + '>');
      return;
    }

    // 获取当前节点处理函数
    var method = visitor[node.type];

    if (method) {
      method(node, parent);
    }

    switch (node.type) {
      // 顶层，遍历其子元素数组
      case 'Program':
        nodeArrTraver(node.body, node);
        break;

      // 函数, 遍历其参数数组
      case 'CallExpression':
        nodeArrTraver(node.params, node);
        break;

      // string, state等没有子节点，跳过
      case 'StringLiteral':
        break;

      case 'StateLiteral':
        break;

      case 'SemLiteral':
        break;

      case 'WhiteLiteral':
        break;

      case 'LineLiteral':
        break;

      case 'ParenbLiteral':
        break;

      default:
        util.errLogg('astTraver过程出错', '\u53D1\u73B0\u672A\u77E5\u7C7B\u578B' + node.type);
    }
  }

  // 从头遍历ast
  nodeTraver(ast, null);
}

// 将ast和traver传入得到新的ast
function transformer(ast) {
  // 创建新的根节点
  var newAst = {
    type: 'Program',
    body: []
  };

  // 在根节点上创建context上下文，用来存放节点
  // context是一个引用，从旧的ast到新的
  ast._context = newAst.body;

  astTraver(ast, {
    // 处理string
    StringLiteral: function StringLiteral(node, parent) {
      // 创建新节点放入父节点context
      parent._context.push({
        type: 'StringLiteral',
        value: node.value
      });
    },

    // 处理state
    StateLiteral: function StateLiteral(node, parent) {
      parent._context.push({
        type: 'StateLiteral',
        value: node.value
      });
    },

    // 处理分号
    SemLiteral: function SemLiteral(node, parent) {
      parent._context.push({
        type: 'SemLiteral',
        value: node.value
      });
    },

    // 处理空格
    WhiteLiteral: function WhiteLiteral(node, parent) {
      parent._context.push({
        type: 'WhiteLiteral',
        value: node.value
      });
    },

    LineLiteral: function LineLiteral(node, parent) {
      parent._context.push({
        type: 'LineLiteral',
        value: node.value
      });
    },

    // 处理大括号
    ParenbLiteral: function ParenbLiteral(node, parent) {
      parent._context.push({
        type: 'ParenbLiteral',
        value: node.value
      });
    },

    // 处理函数
    CallExpression: function CallExpression(node, parent) {
      // 创建CallExpression节点，内嵌套Identifier
      var expression = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: node.name
        },
        isFunc: node.isFunc,
        isBaseFunc: node.isBaseFunc,
        isExistFunc: node.isExistFunc,
        arguments: []
      };

      // 在CallExpression上创建context, 他是arguments的引用
      node._context = expression.arguments;

      // 判断父节点是否为函数
      if (parent.type != 'CallExpression') {
        expression = {
          type: 'ExpressionStatement',
          expression: expression
        };
      }

      parent._context.push(expression);
    }

  });

  return newAst;
}

var notFunc = true; // 标记是否为if,else,for,while

// 打印ast中节点拼接成字符串
function generator(node) {
  switch (node.type) {
    // 遍历根节点所有子元素
    case 'Program':
      return node.body.map(generator).join('');

    // 对于ExpressionStatements，递归调用其属性并加入分号
    case 'ExpressionStatement':
      return generator(node.expression);

    // 对于CallExpressions，我们打印出callee和左括号，然后递归调用其参数，最后加上右括号
    case 'CallExpression':
      notFunc = false; // 设为false 检测到此值分号不换行
      var funcName = generator(node.callee);
      var argArr = node.arguments.map(generator);
      var res = void 0;

      // 是函数
      if (node.isFunc) {
        if (node.isBaseFunc) {
          // 如果是基本函数
          var paramStr = FUNC_HANDLE_MAP[funcName](argArr.join(''));
          res = FUNC_NAME_MAP[funcName] + '(' + paramStr + ')';
        } else if (node.isExistFunc) {
          //如果是已存在函数
          res = 'var ' + funcName + '(' + argArr.join(', ') + ')';
        } else {
          res = 'function ' + funcName + '(' + argArr.join(', ') + ')';
        }
      } else {
        // 不是函数
        res = funcName + '(' + argArr.join('') + ')';
      }

      notFunc = true;
      return res;

    // 返回name
    case 'Identifier':
      return node.name;

    // 返回value
    case 'NumberLiteral':
      return node.value;

    case 'StringLiteral':
      return node.value;

    case 'StateLiteral':
      return node.value + ' ';

    case 'SemLiteral':
      return ';';

    case 'WhiteLiteral':
      return ' ';

    case 'LineLiteral':
      return '\n';

    case 'ParenbLiteral':
      return node.value;

    default:
      util.errLogg('generator过程出错', '\u53D1\u73B0\u672A\u77E5\u7C7B\u578B' + node.type);
  }
}

function compiler(input) {
  var tokens = tokenizer(input);
  util.logg(tokens);
  var ast = parser(tokens);
  util.logg(ast);
  var newAst = transformer(ast);
  util.logg(newAst);
  var output = generator(newAst);
  // util.logg(output);
  return output;
}

// compiler(input);

module.exports = compiler;
},{"./util":11,"./common":13,"./func-name-map":15,"./func-handle-map":17}],7:[function(require,module,exports) {
var compiler = require('./index');

var input = '#include "stdio.h";\nint add(int a,b){\n  int sum = a + b;\n  return sum;\n};\nint main() {\n  string str = "hello world";\n  int a = 3, b = 1;\n  int res = add(a, b);\n  if( res > a ) {\n    printf("the result is %d", res);\n  } else {\n    printf("%s", str);\n  };\n  return 0;\n}';

var test = 'int a[10];\nint a[5] = {1, 3, 4}';

document.getElementById('input').value = input;

document.getElementById('transformBtn').addEventListener('click', function () {
  var value = document.getElementById('input').value;
  var output = compiler(value);
  document.getElementById('output').value = output;
});

document.getElementById('executeBtn').addEventListener('click', function () {
  var value = document.getElementById('output').value;
  value += '\nmain();';
  try {
    var log = eval(value);
    document.getElementById('log').value = log;
  } catch (err) {
    alert(err);
  }
});
},{"./index":9}],19:[function(require,module,exports) {

var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '56647' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id);
  });
}
},{}]},{},[19,7])
//# sourceMappingURL=/dist/a8f89558c1a7a35d0326e4a4fab76ef7.map