const util = require('./util');
const common = require('./common');
const FUNC_NAME_MAP = require('./func-name-map');
const FUNC_HANDLE_MAP = require('./func-handle-map');

const input = 
`
#include "stdlib.h"

int add(a,b){
  int sum = a + b;
  return sum;
};
int main() {
  string str = "hello world";
  int a = 3, b = 1;
  int res = add(a, b);
  if( res > a ) {
    printf("the result is %d", res);
  } else {
    printf("%s", str);
  };
  return 0;
}`

const WHITESPACE = /\s/;
const WORD = /[a-z0-9 | :~,'"%=+/\-*/^></\[/\]!.&]/i;
const NEWLINE = '\n';

let isParWord = false; // 是否为出现在字符串中的括号， 若存在则不单独匹配成一个括号

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
      })
      // 继续循环
      current++;
      continue;
    }
    
    if (char === ')') {
      isParWord = false; // 括号结束

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

    // 检查是否为换行
    if (char === NEWLINE) {
      tokens.push({
        type: 'newline',
        value: '\n'
      })
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

    // 检查是否为字符
    if (WORD.test(char)) {
      let word_str = '';

      // 直到遇到非字符，如果为字符串中的左括号或者右括号也加入字符串中
      // 左括号通过之前的起始(来判断是否在字符串中
      // 右括号通过判断其后面是否有'来确认是否为终结括号
      while((WORD.test(char) && char) || (char === '(' && isParWord) || (char === ')' && input[current + 1] === "'")) {
        word_str += char;
        char = input[++current];
      }

      tokens.push({
        type: 'string',
        value: word_str
      })

      continue;
    }

    // 检查是否为库声明
    if (char === '#') {
      while(char != '\n') {
        char = input[++current];
      }

      continue;
    }

    current++;
  }

  return tokens;
}

let isArr = false;

// tokens转ast
function parser(tokens) {
  let current = 0;

  let temp_ast;
  // 递归遍历
  function getAst() {
    // 遍历token数组

    let token = tokens[current];

    // 判断是否为string类型
    if(token.type === 'string') {
      current++;
      
      // 判断后面是否为函数
      let next_token = tokens[current];
      if(next_token && next_token.type === 'paren' && next_token.value === '(') {
        return null;
      }

      // 是否为数组声明

      // 是否为初始赋值的数组
      let isAssignArr = (next_token && next_token.type === 'parenb' && next_token.value === '{' && tokens[current - 1].value.search('=') != -1);

      // 是否为为赋值数组

      let notAssignArr = (tokens[current - 2] && tokens[current - 2].type === 'state' && tokens[current - 1].value.indexOf('[') != -1 && tokens[current - 1].value.indexOf(']') != -1);
      if(isAssignArr || notAssignArr) {
        let curValue = tokens[current - 1].value;
        let arrValue = curValue.removeStrByIndex(curValue.indexOf('['), curValue.indexOf(']'));

        tokens[current - 1].value = arrValue;
        console.log(arrValue)
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

    if(token.type === 'newline') {
      current++;

      return {
        type: 'LineLiteral',
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

    // 判断是否为大括号 其中判断是否为数组声明
    if (token.type === 'parenb' && (token.value === '{' || token.value === '}')) {
      let value = token.value;
      if((tokens[current - 1].type === 'string' && tokens[current - 1].value.search('=') != -1) || isArr){
        isArr = true;
        if(token.value === '{'){
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
    if(token.type === 'paren' && token.value === '(') {
      // 创建CallExpression节点
      let node = {
        type: 'CallExpression',
        params: [],
        name: '',
        isFunc: true,
        isBaseFunc: true,
        isExistFunc: false
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

          if(!isBaseFunc) {
            ast.body.removeByLastValObj('var');
            node.isBaseFunc = false;
          }

          // 判断是否为已有函数
          let isExistFunc = common.isExistFunc(node.name);
          if(isExistFunc) {
            node.isExistFunc = true;
          }
        }
      }
      
      // 删除函数前面的state声明

      // 跳过括号并且获取下一个token
      token = tokens[++current];

      let tempAst; // 暂存参数

      // 继续遍历直到遇到右括号
      while ((token.type !== 'paren') || (token.type === 'paren' && token.value !== ')')) {
        // 参数放入params
        tempAst = getAst();
        if(tempAst.type === 'StateLiteral') continue;

        node.params.push(tempAst);

        token = tokens[current];

        if(!token) {
          util.errLogg('parser过程出错', `存在括号未闭合错误<${current}>`);
          break;
        }
      }
      // 跳过右括号
      current++;
      return node;
    }

    util.errLogg('parser过程出错', `发现未知类型${token.type}`);

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

    if (!node) {
      util.errLogg('astTraver过程出错', `括号未闭合或出现未知类型<${parent.type}>`);
      return;
    }

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
        util.errLogg('astTraver过程出错', `发现未知类型${node.type}`);
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
    // 处理string
    StringLiteral: function(node, parent) {
      // 创建新节点放入父节点context
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

    LineLiteral: function(node, parent) {
      parent._context.push({
        type: 'LineLiteral',
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
        isExistFunc: node.isExistFunc,
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

let notFunc = true; // 标记是否为if,else,for,while

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
      notFunc = false; // 设为false 检测到此值分号不换行
      let funcName = generator(node.callee);
      let argArr = node.arguments.map(generator);
      let res;

      // 是函数
      if(node.isFunc) {
        if(node.isBaseFunc) {
          // 如果是基本函数
          let paramStr = FUNC_HANDLE_MAP[funcName](argArr.join(''));
          res = `${FUNC_NAME_MAP[funcName]}(${paramStr})`;
        } else if(node.isExistFunc) {
          //如果是已存在函数
          res = `var ${funcName}(${argArr.join(', ')})`;
        } else {
          res = `function ${funcName}(${argArr.join(', ')})`;
        }
      } else {
        // 不是函数
        res = `${funcName}(${argArr.join('')})`;
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
      util.errLogg('generator过程出错', `发现未知类型${node.type}`);
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
  // util.logg(output);
  return output;
}

// compiler(input);

module.exports = compiler;
