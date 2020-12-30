const fs = require('fs');


module.exports = {
    getPeer:()=>{
        let filedata = fs.readFileSync(__dirname+'\\peerPicker.json');
        filedata=JSON.parse(filedata);
        console.log(filedata);
        return filedata;
    }
}