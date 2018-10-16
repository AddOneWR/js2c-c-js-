const util = require('./util');
const common = require('./common');
const FUNC_NAME_MAP = require('./func-name-map');
const FUNC_HANDLE_MAP = require('./func-handle-map');

const inputArr = [
  `
    int add(a,b){
      double c = 1;
    };
    string str = "hello world";
    int a = 3;
    if ( a === 3 ) {
      printf("num1: %d, num2: %d", a, b);
    } else if ( a === 1 ) {
      printf("no pass");
    };
  `
];

const WHITESPACE = /\s/;
const NUMBER = /[0-9]/;
const WORD = /[a-z | :~,'"%=+/\-*/^></\[/\]!]/i;

// 字符串转token
function tokenizer(input) {
  // 字符串当前位置
  let current = 0;

  // 存放token
  let tokens = [];

  // 循环输入的字符串
  while (current < input.length) {
    
    // 获取当前字符
    let char = input[current];

    // 检查是否为声明
    if (common.isState(char, current, input)) {
      // 获取声明后空格索引
      let temp_index = input.slice(current, current + 10).indexOf(' ');
      // 获取声明
      // let temp_state = input.slice(current, temp_index)
      
      current = current + temp_index + 1;

      tokens.push({
        type: 'state',
        value: 'var'
      })


      continue;
    }
    // 检查是否为括号
    if (char === '(') {

      // token添加
      tokens.push({
        type: 'paren',
        value: '('
      })
      // 继续循环
      current++;
      continue;
    }
    
    if (char === ')') {
      tokens.push({
        type: 'paren',
        value: ')'
      })
      current++;
      continue;
    }

    // 检查是否为大括号
    if (char === '{') {
      tokens.push({
        type: 'parenb',
        value: '{'
      })
      current++;
      continue;
    }

    if (char === '}') {
      tokens.push({
        type: 'parenb',
        value: '}'
      })
      current++;
      continue;
    }

    // 检查是否为分号
    if (char === ';') {
      tokens.push({
        type: 'semicolon',
        value: ';'
      })
      current++;
      continue;
    }

    // 检查是否为空格
    if (WHITESPACE.test(char)) {
      tokens.push({
        type: 'whitespace',
        value: ' '
      })
      current++;
      continue;
    }

    if (NUMBER.test(char)) {
      let num_str = '';

      // 遍历到不再是数字
      while(NUMBER.test(char) && char) {
        num_str += char;
        char = input[++current];
      }

      tokens.push({
        type: 'number',
        value: num_str
      })
      
      continue;
    }

    if (WORD.test(char)) {
      // 处理与num类似
      let word_str = '';

      while(WORD.test(char) && char) {
        word_str += char;
        char = input[++current];
      }

      tokens.push({
        type: 'string',
        value: word_str
      })

      continue;
    }

    current++;
  }

  return tokens;
}

// tokens转ast
function parser(tokens) {
  let current = 0;

  let temp_ast;
  // 递归遍历
  function getAst() {
    // 遍历token数组

    let token = tokens[current];

    // 判断是否为number类型
    if(token.type === 'number') {
      current++;

      // 返回ast节点
      return {
        type: 'NumberLiteral',
        value: token.value
      }
    }

    // 判断是否为string类型
    if(token.type === 'string') {
      current++;
      
      // 判断后面是否为函数
      let next_token = tokens[current];
      if(next_token && next_token.type === 'paren' && next_token.value === '(') {
        return null;
      }

      // 否则返回string
      return {
        type: 'StringLiteral',
        value: token.value
      }
    }

    if(token.type === 'semicolon') {
      current++;

      return {
        type: 'SemLiteral',
        value: token.value
      }
    }

    if(token.type === 'whitespace') {
      current++;

      return {
        type: 'WhiteLiteral',
        value: token.value
      }
    }

    // 判断是否为类型声明
    if(token.type === 'state') {
      current++;

      return {
        type: 'StateLiteral',
        value: token.value
      }
    }

    // 判断是否为大括号
    if (token.type === 'parenb' && (token.value === '{' || token.value === '}')) {
      current++;

      return {
        type: 'ParenbLiteral',
        value: token.value
      };
    }

    // 判断是否为括号
    if(token.type === 'paren' && token.value === '(') {
      // 创建CallExpression节点
      let node = {
        type: 'CallExpression',
        params: [],
        name: '',
        isFunc: true,
        isBaseFunc: false
      }

      // 获取函数名
      let pre_index = current - 1;
      let pre_token = tokens[pre_index];

      if(pre_token.type === 'string') {
        node.name = pre_token.value;

        // 判断是否为函数
        let isNotFunc = common.isNotFunc(node.name);
        if(isNotFunc) {
          node.isFunc = false;
        } else {

          // 判断是否为基本函数
          let isBaseFunc = common.isBaseFunc(node.name);

          if(isBaseFunc) {
            node.isBaseFunc = true;
          }
        }
      }
      
      // 删除函数前面的state声明
      ast.body.removeByIndex(current - 2);

      // 跳过括号并且获取下一个token
      token = tokens[++current];

      // 继续遍历直到遇到右括号
      while ((token.type !== 'paren') || (token.type === 'paren' && token.value !== ')')) {
        // 参数放入params
        node.params.push(getAst());
        token = tokens[current];
      }

      // 跳过右括号
      current++;
      return node;
    }

    util.errLogg('parser', token.type);
    current++;
    return;
  }

  // 创建ast
  let ast = {
    type: 'Program',
    body: []
  }

  while(current < tokens.length) {
    temp_ast = getAst();
    if(temp_ast) ast.body.push(temp_ast);
  }

  return ast;
}


// 遍历ast处理节点
function astTraver(ast, visitor) {

  function nodeArrTraver(arr, parent) {
    arr.forEach(function(child) {
      nodeTraver(child, parent)
    })
  }

  function nodeTraver(node, parent) {
    // 获取当前节点处理函数
    let method = visitor[node.type];

    if(method) {
      method(node, parent)
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
      
      // number, string, state等没有子节点，跳过
      case 'NumberLiteral':
        break;
      
      case 'StringLiteral':
        break;

      case 'StateLiteral':
        break;

      case 'SemLiteral':
        break;
      
      case 'WhiteLiteral':
        break;

      case 'ParenbLiteral':
        break;
      
      default:
        util.errLogg('astTraver', node.type);
    }
  }

  // 从头遍历ast
  nodeTraver(ast, null);
}

// 将ast和traver传入得到新的ast
function transformer(ast) {
  // 创建新的根节点
  let newAst = {
    type: 'Program',
    body: []
  };

  // 在根节点上创建context上下文，用来存放节点
  // context是一个引用，从旧的ast到新的
  ast._context = newAst.body;

  astTraver(ast, {

    // 处理number
    NumberLiteral: function(node, parent) {
      // 创建新节点放入父节点context
      parent._context.push({
        type: 'NumberLiteral',
        value: node.value
      });
    },

    // 处理string
    StringLiteral: function(node, parent) {
      parent._context.push({
        type: 'StringLiteral',
        value: node.value
      });
    },

    // 处理state
    StateLiteral: function(node, parent) {
      parent._context.push({
        type: 'StateLiteral',
        value: node.value
      });
    },

    // 处理分号
    SemLiteral: function(node, parent) {
      parent._context.push({
        type: 'SemLiteral',
        value: node.value
      })
    },

    // 处理空格
    WhiteLiteral: function(node, parent) {
      parent._context.push({
        type: 'WhiteLiteral',
        value: node.value
      })
    },

    // 处理大括号
    ParenbLiteral: function(node, parent) {
      parent._context.push({
        type: 'ParenbLiteral',
        value: node.value
      })
    },

    // 处理函数
    CallExpression: function(node, parent) {
      // 创建CallExpression节点，内嵌套Identifier
      let expression = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: node.name
        },
        isFunc: node.isFunc,
        isBaseFunc: node.isBaseFunc,
        arguments: []
      };

      // 在CallExpression上创建context, 他是arguments的引用
      node._context = expression.arguments;

      // 判断父节点是否为函数
      if(parent.type != 'CallExpression') {
        expression = {
          type: 'ExpressionStatement',
          expression: expression
        }
      }

      parent._context.push(expression);
    }

  });

  return newAst;
}

// 打印ast中节点拼接成字符串
function generator(node) {
  switch (node.type) {
    // 遍历根节点所有子元素
    case 'Program':
      return node.body.map(generator).join('');
    
    // 对于ExpressionStatements，递归调用其属性并加入分号
    case 'ExpressionStatement':
      return (
        generator(node.expression)
      )

    // 对于CallExpressions，我们打印出callee和左括号，然后递归调用其参数，最后加上右括号
    case 'CallExpression':
      let funcName = generator(node.callee);
      let argArr = node.arguments.map(generator);
      let res;

      // 是函数
      if(node.isFunc) {
        // 是不是基本函数
        if(node.isBaseFunc) {
          let paramStr = FUNC_HANDLE_MAP[funcName](argArr.join(''))
          res = `${FUNC_NAME_MAP[funcName]}(${paramStr})`
        } else {
          res = `function ${funcName}(${argArr.join(', ')})`
        }
      } else {
        // 不是函数
        res = `${funcName}(${argArr.join('')})`;
      }

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
      return ';\n';
    
    case 'WhiteLiteral':
      return ' ';

    case 'ParenbLiteral':
      return (
        node.value + (node.value === '{' ? '\n' : '')
      );

    default:
      util.errLogg('generator', node.type);
  }
}

function compiler(input) {
  let tokens = tokenizer(input);
  util.logg(tokens);
  let ast = parser(tokens);
  util.logg(ast);
  let newAst = transformer(ast);
  util.logg(newAst);
  let output = generator(newAst);
  util.logg(output)
}

inputArr.forEach(item => compiler(item));

