const compiler = require('./index');

let input = `#include "stdio.h";
int add(int a,b){
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
}`;

let test = `int a[10];
int a[5] = {1, 3, 4}`

document.getElementById('input').value = input;

document.getElementById('transformBtn').addEventListener('click', function() {
  let value = document.getElementById('input').value;
  let output = compiler(value);
  document.getElementById('output').value = output;
})

document.getElementById('executeBtn').addEventListener('click', function() {
  let value = document.getElementById('output').value;
  value += `\nmain();`;
  try {
    let log = eval(value);
    document.getElementById('log').value = log;
  } catch (err) {
    alert(err);
  }
})