const clientIo = require('socket.io-client');
const http = require('http').createServer();
const serverIo = require('socket.io')(http);
const fs = require('fs');
const peerNode =  require('../services/getPeer.js');

module.exports = {
    sentFileToPeer:function(dirpath,files,username,callback){ //Received destination directory, file metadata, file owner
        console.log(files);
        let p = peerNode.getPeer()[0]; //In this line, a destination peer should be randomly selected but for easing our test cases, we have always selected the first peer node.
        let clientSocket  = clientIo.connect("http://"+p.ipv4+":"+p.port); //Connect to selected peer/node
        let fileMetaData = { //Encapsulate file metadata
            Filename:files.name,
            Filehash:files.sha1,
            CreatedAt:Date.now(),
            CreatedBy:username,
            Filesize:files.size
        }
        clientSocket.emit('sendFileMetaData',fileMetaData); //Emit to connected peer
        console.log('files meta data ',fileMetaData);
        let dirFiles = fs.readdirSync(dirpath); // read destination directory
        let chunkSendCount = 0; //Set file chunk count
        console.log('inside socketService module ');
        console.log("http://"+p.ipv4+":"+p.port);
        clientSocket.on('promtFile',function(message){ //Listen for prompt file event from connected peer

            console.log('promit file ------',message);
            for(let i=0;i<dirFiles.length;i++) //Iterate through loaded directory
            {
                let fileObject ={} //Initiate file object
                fileObject['filename']=dirFiles[i]; //Assign file name (with current chunk number) to file object.
                console.log(dirpath+'/'+dirFiles[i]);

                fs.readFile(dirpath+'/'+dirFiles[i],(err,data)=>{ //Open currently pointed chunk of the whole file
                    if(err==null || err==undefined) //If file error is null,
                    {
                        fileObject['buffer']=data; //Assign selected file buffer to file object
                        console.log(fileObject);
                        clientSocket.emit('processFile',fileObject); //Send file object which contains file name and file buffer to selected socket
                    }
                    else
                    {
                        console.log(err);
                    }
                });
            }
        });

        clientSocket.on('processed',function(message){ //listen for file process confirmation
            console.log(message);
            chunkSendCount++;
            if(chunkSendCount==dirFiles.length) //If all chunks are sent
            {
                clientSocket.close(); //then close socket
                callback('done'); //Send success message
            }

        });

    }
}