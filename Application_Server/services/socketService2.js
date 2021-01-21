const clientIo = require('socket.io-client');
const http = require('http').createServer();
const serverIo = require('socket.io')(http);
const fs = require('fs');
const peerNode =  require('../services/getPeer.js');

module.exports = {
    sentFileToPeer:function(dirpath,files,username,callback){
        console.log(files);
        let p = peerNode.getPeer()[0];
        let clientSocket  = clientIo.connect("http://"+p.ipv4+":"+p.port);
        let fileMetaData = {
            Filename:files.name,
            Filehash:files.sha1,
            CreatedAt:Date.now(),
            CreatedBy:username,
            Filesize:files.size
        }
        clientSocket.emit('sendFileMetaData',fileMetaData);
        console.log('files meta data ',fileMetaData);
        let dirFiles = fs.readdirSync(dirpath);
        let chunkSendCount = 0;
        console.log('inside socketService module ');
        console.log("http://"+p.ipv4+":"+p.port);
        clientSocket.on('promtFile',function(message){
            
            console.log('promit file ------',message);
            for(let i=0;i<dirFiles.length;i++)
            {
                let fileObject ={}
                fileObject['filename']=dirFiles[i];
                console.log(dirpath+'/'+dirFiles[i]);
                
                fs.readFile(dirpath+'/'+dirFiles[i],(err,data)=>{
                    if(err==null || err==undefined)
                    {
                        fileObject['buffer']=data;
                        console.log(fileObject);
                        clientSocket.emit('processFile',fileObject);
                    }
                    else
                    {
                        console.log(err);
                    }
                });
            }
        });

        clientSocket.on('processed',function(message){
            console.log(message);
            chunkSendCount++;
            if(chunkSendCount==dirFiles.length)
            {
                clientSocket.close();
                callback('done');
            }
           
        });

    }
}
