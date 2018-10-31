const NOTFUNC = /^(if|else|else if|for|while)[\s]*$/;
const BASEFUNC = /^(print|printf)[\s]*$/;
const shorChar = ['c', 'i', 's', 'l', 'd', 'f', 'b'];

const common = {
  isState: function(char, current, input) {

    let str = input.slice(current, current + 7);
  
    if(str.indexOf("char") != -1 || str.indexOf("int") != -1 || str.indexOf("short") != -1 || str.indexOf("long") != -1 || str.indexOf("double") != -1 || str.indexOf("float") != -1 || str.indexOf("string") != -1 || str.indexOf("bool") != -1) {
      if(!shorChar.includes(char)){
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
    if(NOTFUNC.test(name)) {
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
  },

  isExistFunc: function(name) {
    if(name.includes('=')) {
      return true;
    }

    return false;
  }
}

module.exports = common;