
const clientIo = require('socket.io-client');
const http = require('http').createServer();
const serverIo = require('socket.io')(http);
const fs = require('fs');
var os = require('os');
var ipv4 = (require("ip")).address();
// load peerlist
var file = fs.readFileSync('IPList.json');
var iplist = (JSON.parse(file)).iplist;

//init peerlist
var peerlist = [];

for(var i=0;i<iplist.length;i++)
{
    peerlist.push(clientIo.connect("http://"+iplist[i][0]+":"+iplist[i][1]));
}


for(var i=0;i<peerlist.length;i++)
{
  
    if(iplist[i][0]!=ipv4)
    {
        peerlist[i].on('message',(data)=>{
            console.log(ipv4+" connected with "+data);
        });
    
        peerlist[i].on("send",(data)=>{
            console.log("data received from :  " +data);
        });
    }
 
} 

serverIo.on('connection',(socket)=>{
    socket.send(ipv4);
    socket.emit('send',ipv4);
    
});

http.listen(6000,()=>{
    console.log(ipv4+" is launched!");
});