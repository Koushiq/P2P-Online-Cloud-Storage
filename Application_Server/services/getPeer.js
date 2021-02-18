const fs = require('fs');


module.exports = {
    getPeer:()=>{ //Load tracker
        let filedata = fs.readFileSync('trackers.json'); //tracker is list of nodes/hosts in our peer to peer network
        filedata=JSON.parse(filedata);
        return filedata;
    }
}