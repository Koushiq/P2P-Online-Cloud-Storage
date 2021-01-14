const splitFile = require('split-file');

const fs = require('fs');

let names = fs.readdirSync('downloaded');

for(let i=0;i<names.length;i++)
{
    let str="downloaded/"+names[i];
    names[i]=str;
}
console.log(names);
splitFile.mergeFiles(names,'1.jpg')
  .then(() => {
    console.log('Done!');
  })
  .catch((err) => {
    console.log('Error: ', err);
  });