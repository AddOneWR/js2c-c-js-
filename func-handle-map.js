const FUNC_HANDLE_MAP = {
  printf: function(arg) {
    let firstParamIndex = arg.indexOf('%');
    let lastQuoIndex = arg.lastIndexOf('"');
    let paramStr = [];

    // 获取后面参数，+2跳过引号和逗号, 最后再去掉空格
    let argStr = arg.slice(lastQuoIndex + 2, arg.length).replaceAll(' ', '');

    // 获取参数数组
    let argArr = argStr.split(',')

    let percentage = arg.indexOf('%');

    // 起始为1跳过引号
    let start = 1;
    while(percentage != -1) {

    }
    paramStr.push(arg.slice(1, firstParamIndex));
    console.log(argArr)
    console.log(arg);
    console.log(arg.indexOf('%'))
    console.log(paramStr);
  }
}

module.exports = FUNC_HANDLE_MAP;
