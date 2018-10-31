const compiler = require('./index');

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