// 按值删除数组中元素
Array.prototype.removeByVal = function(val) {
  var index = this.indexOf(val);
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
  const reg = new RegExp(f, "g");  
  return this.replace(reg, e); 
}

const util = {
  logg: function(content) {
    console.log('----------------------\n');
    console.log(content);
    console.log();
    console.log('----------------------\n');
  },

  errLogg: function(func, type) {
    console.log("---------error--------\n");
    console.error(`${func}: Unknown ${type}`);
    console.log();
    console.log('---------error--------\n');
  }
}

module.exports = util;