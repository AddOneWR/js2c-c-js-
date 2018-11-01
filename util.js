// 按值删除数组中元素
Array.prototype.removeByVal = function(val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

// 按值删除数组中最后一个匹配的元素
Array.prototype.removeByLastVal = function(val) {
  var index = this.lastIndexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

// 按值删除数组对象中最后一个匹配的元素
Array.prototype.removeByLastValObj = function(val) {
  let index = -1;
  for(let i = 0 ; i < this.length ; i++) {
    if(this[i].value === val) index = i;
  }
  if (index > -1) {
    this.splice(index, 1);
  }
};

// 按索引删除数组中元素
Array.prototype.removeByIndex = function(index) {
  this.splice(index, 1);
};

// 全部替换
String.prototype.replaceAll = function(f, e) {
  let reg = new RegExp(f, "g");  
  return this.replace(reg, e); 
}

String.prototype.removeStrByIndex = function(start, end) {
  let firstStr = this.slice(0, start);
  let lastStr = this.slice(end + 1);
  return firstStr + lastStr;
}

const util = {
  logg: function(content) {
    console.log('--------------------------------------------\n');
    console.log(content);
    console.log();
    console.log('--------------------------------------------\n');
  },

  errLogg: function(func, content) {
    console.log("-------------error------------\n");
    console.error(`${func}: ${content}`);
    console.log();
    console.log('-------------error------------\n');
  }
}

module.exports = util;