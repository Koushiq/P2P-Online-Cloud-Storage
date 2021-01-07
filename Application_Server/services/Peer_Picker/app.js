const clientIo = require('socket.io-client');
const http=require('http').createServer();
const serverIo = require('socket.io')(http);
const ipv4 = (require("ip")).address();
const fs = require('fs');

let latencyList= [];

function connection()
{
    serverIo.on('connection',function(socket){
    socket.emit('ping',"message sent from server");
    let startTime = Date.now();
    socket.on('pong',function(data){
        let latency = Date.now()-startTime;
            let receiver = {
                ipv4:data.ip,
                port:data.port,
                responseTime:latency
            };
            latencyList.push(receiver);
            latencyList.sort((a, b) => (a.responseTime > b.responseTime) ? 1 : -1);
        });
    });
}

http.listen(6000,()=>{
    console.log("6000 port of app server launched for monitoring latency in p2p network ");
});


connection();

setTimeout(function(){
   fs.writeFileSync('peerPicker.json',JSON.stringify(latencyList,null,4));
   serverIo.close();
},3000);