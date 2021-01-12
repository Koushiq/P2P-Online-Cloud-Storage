const fs = require('fs');
const getPeer = require('./getPeer.js');
const client = require('socket.io-client');
const splitFile = require('split-file');
module.exports= {
    initFile:function(object,callback){

        let socketList = [];
        let fileHash = object.results[0].Filehash;
        let fileName = object.results[0].Filename;
        let fileExtension= fileName.split('.');
            fileExtension=fileExtension[fileExtension.length-1];
        
        let dhtData = JSON.parse(fs.readFileSync('dht.json'));
        let peerList = getPeer.getPeer();
        let chunkCount=0;
        console.log( object.results[0]);
        console.log(peerList);
        let activePeerTrack=[];
        let chunkList = [];
        let visited = [];
        if(dhtData[fileHash]!=undefined)
        {
            chunkCount  =  Math.ceil(dhtData[fileHash]/(500*1024));
            
            for(let i=0;i<chunkCount;i++)
            {
                let str=fileHash+"."+fileExtension+".sf-part";
                if(i<9)
                {
                    str+="0";
                }
                str+=(i+1);
                chunkList.push(str);
            }

            console.log('displaying chunk list ');
            console.log(chunkList);
           
            for(let i=0;i<peerList.length;i++)
            {
                socketList.push(client.connect("http://"+peerList[i].ipv4+":"+peerList[i].port));
                socketList[i].on('promtDownload',function(data){
                    console.log(data);
                    activePeerTrack.push(i);
                    
                    if(activePeerTrack.length>0)
                    {
                        for(let j=0,k=0;j<chunkList.length;j++)
                        {
                            socketList[activePeerTrack[k]].on('downloadFileHash',function(message){
                                console.log(message);
                                socketList[activePeerTrack[k]].emit('retriveFile',chunkList[j]);
                                k++;
                                k=k%activePeerTrack.length;
                            });
                        }
                    }
                    else
                    {
                        console.log('active peer does not exits');
                    }
                });

                let downloadCount=0;
                let paths=[];
                socketList[i].on('filedata',function(message){
                    let path="downloaded/"+fileHash+"."+fileExtension+".sf-part";
                    downloadCount++;
                    if(downloadCount<10)
                    {
                        path+="0";
                    }
                    paths.push(path+downloadCount);
                    fs.writeFile(paths[paths.length-1],message,(err)=>{
                        console.log(err);
                        if(chunkCount==downloadCount)
                        {
                            splitFile.mergeFiles(paths, 'downloaded/'+fileName)
                            .then(() => {
                                console.log('Done!');
                            })
                            .catch((err) => {
                                console.log('Error: ', err);
                            });

                            downloadCount=0;
                            paths=[];

                        }
                    });
                });

            }

        }
        else
        {
            callback('invalid');
        }
       

        //callback(dhtData[fileHash]);
    }
}