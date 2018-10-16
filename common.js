const IFELSE = /^(if|else|else if)[\s]*$/;
const BASEFUNC = /^(print|printf)[\s]*$/;

const common = {
  isState: function(char, current, input) {

    let str = input.slice(current, current + 7);
  
    if(str.indexOf("char") != -1 || str.indexOf("int") != -1 || str.indexOf("short") != -1 || str.indexOf("long") != -1 || str.indexOf("double") != -1 || str.indexOf("float") != -1 || str.indexOf("string") != -1) {
      if(char != 'c' && char != 'i' && char != 's' && char != 'l' && char != 'd' && char != 'f'){
        return false;
      }
      if(str.indexOf(' ') === -1) {
        return false;
      }
      return true;
    }

    str = input.slice(current, current + 10);
    if(str.indexOf("long long") != -1 || str.indexOf("long double") != -1) {
      if(char != 'l') {
        return false;
      }
      if(str.indexOf(' ') === -1) {
        return false;
      }
      return true;
    }

    return false;
  },

  isNotFunc: function(name) {
    if(IFELSE.test(name)) {
      return true;
    }

    // 是函数
    return false;
  },

  isBaseFunc: function(name) {
    if(BASEFUNC.test(name)) {
      return name;
    }

    return false;
  }
}

module.exports = common;