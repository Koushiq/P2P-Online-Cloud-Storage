const fs = require('fs');


module.exports = {
    getPeer:()=>{
        let filedata = fs.readFileSync(__dirname+'/Peer_Picker/peerPicker.json');
        filedata=JSON.parse(filedata);
        return filedata;
    }
}