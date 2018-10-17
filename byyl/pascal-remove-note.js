let input = 
`var 
  a,b:real;
  // dawdiwah
begin
  {
    ddd
    calwied
  }
  read(a,b);  
  write(a+b);  
end.
`

function removeNote(input) {
  let strArr = Array.from(input);
  let noteIndex = input.search('//');

  while(noteIndex != -1) {
    for(let i = noteIndex ; i < strArr.length ; i++) {
      if(strArr[i] === '\n') {
        strArr.splice(noteIndex, i - noteIndex);
        break;
      }
    }

    noteIndex = strArr.join('').search('//');
  }

  let noNoteStr = strArr.join('');
  let parenIndex = noNoteStr.search('{');
  let p_i;
  while(parenIndex != -1) {
    p_i = parenIndex;
    while(p_i < noNoteStr.length) {
      if(strArr[p_i] != '}'){
        strArr.splice(p_i, 1);
        p_i--;
      } else {
        strArr.splice(p_i, 1);
        break;
      }
      p_i++;
    }

    parenIndex = strArr.join('').search('{');
  }

  console.log(strArr.join(''));
}

removeNote(input);
