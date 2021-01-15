const fs = require('fs');


module.exports = {
    getPeer:()=>{
        let filedata = fs.readFileSync('trackers.json');
        filedata=JSON.parse(filedata);
        return filedata;
    }
}