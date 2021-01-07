const fs = require('fs');

let dir = fs.readdirSync("../../tmp");
let dir2 = fs.readdirSync("../../tmp");

let ob = {};

ob['files']=dir;
ob['files'][0]='asadasdas123123123120';
let xp = {};
xp['files']=dir2;

console.log(ob);
console.log(xp);
let flag= false;

for(let i=0;i<xp['files'].length;i++)
{
    if(ob['files'][i]!=xp['files'][i])
    {
        flag=true;
        break;
    }
    
}
