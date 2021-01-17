const fs = require('fs');
const getPeer = require('./getPeer.js');
const client = require('socket.io-client');
const splitFile = require('split-file');
const encryptor = require('file-encryptor');
module.exports= {
    initFile:function(object,callback){
        let key = 'random';
        let downloadCount=0;
        let socketList = [];
        let paths=[];
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
        let visited = {};
        if(dhtData[fileHash]!=undefined)
        {
            chunkCount  =  Math.ceil(dhtData[fileHash]/(512*1024));
            let digitCount =0 ;
            let x= chunkCount;
           // console.log('digit count ',x);
            let digitPrefix='';
            while(x!=0)
            {
                console.log(x);
                x=x/10;
                x=Math.floor(x);
                digitCount++;
            }


           // console.log('digit prefix '+digitPrefix);
            for(let i=0;i<chunkCount;i++)
            {
                let str='';
                str=fileHash+"."+fileExtension+".sf-part";
                let target=((i+1).toString()).length;
                let destination =( digitCount.toString()); 
                for(let j=target;j<digitCount;j++)
                {
                    str+='0';
                }
              

                str+=(i+1);
                console.log(str);
                chunkList.push(str);
            }

            console.log('displaying chunk list ');
            console.log(chunkList);
           
            for(let i=0;i<peerList.length;i++)
            {
                socketList.push(client.connect("http://"+peerList[i].ipv4+":"+peerList[i].port));
                socketList[i].on('promtFile',function(data){
                    console.log(data);
                    activePeerTrack.push(i); // 4 
                });

                setTimeout(function(){

                    if(activePeerTrack.length>0)
                    {
                        for(let j=0,k=0;j<chunkList.length;j++)
                        {
                          
                            if(visited[j]!=true || visited[j]==undefined)
                            {
                                socketList[activePeerTrack[k]].emit('retriveFile',chunkList[j]);
                                visited[j]=true;
                            }
                            k++;
                            k=k%activePeerTrack.length;
                        }
                    }
                    else
                    {
                        console.log('active peer does not exits');
                    }
                         
                },1000);

               
               
                socketList[i].on('filedata',function(message){
                    
                    let path="downloaded/"+message['filename'];
                    downloadCount++;
                    console.log('download count = '+downloadCount);
                    console.log('chunk count '+chunkCount);
                    paths.push(path);
                    fs.writeFile(path,message['buffer'],(err)=>{
                        console.log('Error inside async fs write ',err);
                        if(chunkCount==downloadCount)
                        {
                            paths.sort();
                            console.log('paths of file to be written to disk',paths);
                            splitFile.mergeFiles(paths, 'downloaded/'+fileHash)
                            .then(() => {
                                /*encryptor.decryptFile('encrypted.dat', 'output_file.txt', key, function(err) {
                                    // Decryption complete.
                                });*/
                                console.log('paths length = > '+paths.length);
                                for(let j=0;j<paths.length;j++)
                                {
                                    fs.unlink(paths[j],function (err){
                                        console.log(err);
                                    });
                                }

                                console.log('Done!');
                                downloadCount=0;
                                paths=[];
                                callback(`${__dirname}`+`/../downloaded/`+fileHash);
                            })
                            .catch((err) => {
                                console.log('Error: ', err);
                                callback('invalid');
                            });

                        }
                    });
                }); 
            }
        }
        else
        {
            callback('invalid');
        }
    }
}