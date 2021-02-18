const fs = require('fs');
const getPeer = require('./getPeer.js');
const client = require('socket.io-client');
const splitFile = require('split-file');
const encryptor = require('file-encryptor');
module.exports= {
    initFile:function(object,callback){
        let key = 'random'; //Set dec key
        let downloadCount=0; //Set download count
        let socketList = []; //Initialize socket list
        let paths=[]; //Initialize to be downloaded files path list
        let fileHash = object.results[0].Filehash; //Assign file hash
        let fileName = object.results[0].Filename; //Assign file name
        let fileExtension= fileName.split('.'); //Assign file extension
            fileExtension=fileExtension[fileExtension.length-1];

        let dhtData = JSON.parse(fs.readFileSync('dht.json')); //Load DHT data
        let peerList = getPeer.getPeer(); //get all nodes from peer list
        let chunkCount=0; //Set chunk count to zero
        console.log( object.results[0]);
        console.log(peerList);
        let activePeerTrack=[]; //Initialize active peer track list
        let chunkList = []; //Initialize chunk list
        let visited = {}; //Initialized visited object
        if(dhtData[fileHash]!=undefined) //if file hash is found in DHT
        {
            chunkCount  =  Math.ceil(dhtData[fileHash]/(512*1024)); //Calculate chunk count of the to be downloaded files
            let digitCount =0 ;
            let x= chunkCount;
           // console.log('digit count ',x);
            let digitPrefix='';
            while(x!=0) //Initialize file name (chunk number) prefix
            {
                console.log(x);
                x=x/10;
                x=Math.floor(x);
                digitCount++;
            }


           // console.log('digit prefix '+digitPrefix);
            for(let i=0;i<chunkCount;i++) //Assign file chunk prefix to chunk list
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

            for(let i=0;i<peerList.length;i++) //Iterate peer list
            {
                socketList.push(client.connect("http://"+peerList[i].ipv4+":"+peerList[i].port)); //Connect to current pointed peer
                socketList[i].on('promtFile',function(data){ //Listen for current peer prompt file event which wil be initialize  on connect
                    console.log(data);
                    activePeerTrack.push(i); // Push if peer is connected
                });


                //SetTimeout is used to determine which peers have connected in given duration
                setTimeout(function(){

                    if(activePeerTrack.length>0) //Check if connected peers list length > 0
                    {
                        for(let j=0,k=0;j<chunkList.length;j++) //Iterated through  requested files chunk list
                        {

                            if(visited[j]!=true || visited[j]==undefined) //Check if a file has been assigned to a peer node for downloading
                            {
                                socketList[activePeerTrack[k]].emit('retriveFile',chunkList[j]); //if not then emit current peer and pass requested file's chunk
                                visited[j]=true; //Set visited to true means the file has been assigned to a peer for downloading, so that another peer doesn't download the same chunk.
                            }
                            k++;
                            k=k%activePeerTrack.length; //Mod so that value of K (which is indexing the connected peers list) is not out of bound
                        }
                    }
                    else
                    {
                        console.log('active peer does not exits');
                    }

                },1000);



                socketList[i].on('filedata',function(message){ //Listen for requested file chunk is being sended by the assigned peer

                    let path="downloaded/"+message['filename']; //Initialized to be downloaded file path
                    downloadCount++; //Increase download count
                    console.log('download count = '+downloadCount);
                    console.log('chunk count '+chunkCount);
                    paths.push(path); //Push current path to path list
                    fs.writeFile(path,message['buffer'],(err)=>{ //Write file chunk from received peer
                        console.log('Error inside async fs write ',err);
                        if(chunkCount==downloadCount) //if total chunk count == download count
                        {
                            paths.sort(); //Sort the paths from path list
                            console.log('paths of file to be written to disk',paths);
                            splitFile.mergeFiles(paths, 'downloaded/'+fileHash) //Merge files since all chunks are downloaded
                            .then(() => {
                                /*encryptor.decryptFile('encrypted.dat', 'output_file.txt', key, function(err) { //Decrypt file
                                    // Decryption complete.
                                });*/
                                /*fs.readFile('download.json',(err,data)=>{
                                    console.log(err);
                                    console.log(data);
                                    let x =[];
                                     x = JSON.parse(data);
                                    x[fileHash]=Date.now()+ (1000*3600*24);
                                    fs.writeFile('download.json',JSON.stringify(x,null,4),(err)=>{
                                                if(err==null)
                                                {
                                                    console.log('JSON log updated');
                                                }
                                    });
                                });*/
                                let x =JSON.parse( fs.readFileSync('download.json'));
                                x[fileHash]=Date.now()+ (1000*3600*24); //Set download cache duration
                                fs.writeFileSync('download.json',JSON.stringify(x,null,4)); //Write info to download.json
                                console.log('paths length = > '+paths.length);
                                for(let j=0;j<paths.length;j++)
                                {
                                    fs.unlink(paths[j],function (err){ //Remove chunks since file is merged
                                        console.log(err);
                                    });
                                }

                                console.log('Done!');
                                downloadCount=0;
                                paths=[];
                                callback(`${__dirname}`+`/../downloaded/`+fileHash); //Send directory to calling function
                            })
                            .catch((err) => {
                                console.log('Error: ', err);
                                callback('invalid'); //Send error message since process was not successful
                            });

                        }
                    });
                });
            }
        }
        else
        {
            callback('invalid');//Send error message since process was not successful
        }
    }
}