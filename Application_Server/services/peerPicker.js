const clientIo = require('socket.io-client');
const http=require('http').createServer();
const serverIo = require('socket.io')(http);
const fs = require('fs');
const ipv4 = (require("ip")).address();

const file = fs.readFileSync('IPList.json');

const iplist = (JSON.parse(file)).iplist;
//console.log(iplist);

let peerList = [];

function getPeer()
{
    var startTime;
    for(i=0;i<iplist.length;i++)
    {
        if(iplist[i][0]!=ipv4)
        {
            console.log("http://"+iplist[i][0]+":"+iplist[i][1]);
            peerList.push(clientIo.connect("http://"+iplist[i][0]+":"+iplist[i][1]));
        }
    }
  //  console.log("peerlist",peerList);
    //global connection
   /*  serverIo.on('connection',(socket)=>{
        startTime=Date.now();
        socket.emit('ping');
    }); */

    for(i=0;i<peerList.length;i++)
    {
        
        peerList[i].emit('ping');
        let startTime=Date.now();
        peerList[i].on('pong',function(){
            latency  = Date.now()- startTime;
            console.log(latency); // bind latency with ipv4 and port 
            //console.log("taking "+latency+" ms from "+peerList[i].Socket.io);
        });
    }

}

http.listen(6000,()=>{
    console.log("6000 port of app server launched for monitoring latency in p2p network ");
});

getPeer();