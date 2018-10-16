const FUNC_HANDLE_MAP = {
  printf: function(arg) {
    let lastQuoIndex = arg.lastIndexOf('"');
    let paramStr = '';

    // 获取后面参数，+2跳过引号和逗号, 最后再去掉空格
    let argStr = arg.slice(lastQuoIndex + 2, arg.length).replaceAll(' ', '');

    // 获取参数数组
    let argArr = argStr.split(',')

    let percentage = arg.indexOf('%');

    // 起始为1跳过引号
    let argIndex = 0;

    if (percentage === -1) {
      // 没有参数则直接返回字符串
      paramStr = arg;
    } else {
      while (percentage != -1) {
        // 用加号拼接str和参数
        paramStr += `'${arg.slice(1, percentage)}' + ${argArr[argIndex]}`
  
        // 将之前的字符串截取出去
        arg = arg.slice(percentage + 1, arg.length);
  
        // 获取下一个占位符
        percentage = arg.indexOf('%');
        
        // 参数数组自增
        argIndex++;
  
        if(percentage != -1) {
          paramStr += ' + ';
        }
      }
    }
    
    return paramStr;
  }
}

module.exports = FUNC_HANDLE_MAP;
