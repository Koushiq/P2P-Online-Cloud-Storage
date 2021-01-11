const clientIo = require('socket.io-client');
const http = require('http').createServer();
const serverIo = require('socket.io')(http);
const fs = require('fs');
const peerNode =  require('../services/getPeer.js');


let p = peerNode.getPeer()[1];
let clientSocket  = clientIo.connect("http://"+p.ipv4+":"+p.port);
let dirNames = fs.readdirSync(__dirname+'/../tmp/');
let socketId = null;

console.log(dirNames);

let dhtData = JSON.parse(fs.readFileSync('../dht.json'));

console.log(dhtData);

let delcount = 0;
if(dirNames.length>0)
{
    serverIo.on('connection',function(socket){

    socket.emit('promtFileShare','promt for file share');

        socket.on('done',function(ipv4){
            if(ipv4==p.ipv4)
            {
                socketId=socket.id;
                // validate chunk count 
                for(let i=0;i<dirNames.length;i++)
                {
                    if(dhtData[dirNames[i]]!=undefined)
                    {
                        let chunkCount = Math.ceil((dhtData[dirNames[i]]) / (500*1024)) ; 
                        //console.log(`chunk count  =  `,chunkCount);
                        let chunkCountInFolder = fs.readdirSync(__dirname+'/../tmp/'+dirNames[i]);
                       // console.log(`chunk count in folder `,chunkCountInFolder.length);
                        if(chunkCountInFolder.length==chunkCount)
                        {
                            let filebuffer=[];
                            let fileobject = {};
                            
                            for(let j=0;j<chunkCountInFolder.length;j++)
                            {
                               let filepath= '../tmp/'+dirNames[i]+'/'+chunkCountInFolder[j];
                               filebuffer.push(fs.readFileSync(filepath));
                            }
                            let fileExtension =chunkCountInFolder[0].split('.');
                            fileobject[dirNames[i]+"."+fileExtension[fileExtension.length-2]]=filebuffer;

                            serverIo.to(socketId).emit('sendfile',fileobject);
                            
                        }
                        else
                        {
                            console.log('chunk count did not match' );
                            process.exit(1);

                        }
                    }
                    else
                    {
                        //fs remove file
                    }
                }
               
            }
        });

        socket.on('deletefile',function(message){
            let dir =__dirname+'/../tmp/'+ dirNames[delcount];
            try {
                fs.rmdirSync(dir, { recursive: true });
            
                console.log(`${dir} is deleted!`);
            } catch (err) {
                console.error(`Error while deleting ${dir}.`);
            }

            delcount++;
            if(delcount==dirNames.length)
            {
                console.log('connection terminated');
                process.exit(1);
            }
            //console.log(message);
           
        });

    });

    


}
else
{
    console.log('no files in dir terminating');
    process.exit(1);
}

http.listen(6000,()=>{
    console.log('socket server fired');
});