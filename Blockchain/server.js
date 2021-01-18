var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var clio = require('socket.io-client');
var socket1 = clio.connect("http://localhost:3001");
var socket2 = clio.connect("http://localhost:3002")
var socket3 = clio.connect("http://localhost:3003")
var socketlist = [];
let conncount = 0;
let integrityVote = 0;
let totalpeer = 3;
let port = 5000;
let fs = require('fs');
const ipv4 = (require("ip")).address();




let data = JSON.parse(fs.readFileSync('datasource.json'));
console.log(data);




io.on('connection', (socket)=> {
    conncount++
    if(conncount==2){
        console.log(socket.id);
        for(let i = 0; i<data.length; i++){
            io.to(socket.id).emit('block',data[i]['data']);
        }


    }
});

let sockets = JSON.parse(fs.readFileSync('trackerlist.json'));
let localtrackers = sockets;

for(let i = 0; i<sockets.length; i++){
    if(parseInt(sockets[i]['port']) !== port){
        console.log(sockets[i]['port']);
        socketlist.push(clio.connect("http://"+sockets[i]['ipv4']+":"+sockets[i]['port']));
    }
}

for(let i = 0; i<socketlist.length; i++){
    if( socketlist[i]['ipv4'] !== ipv4 || parseInt(socketlist[i]['port']) !== port){
        socketlist[i].on('message', (data)=>{
           console.log(data);
        });
    }
    else{
        console.log('Same Port');
    }
}

for(let i = 0; i<socketlist.length; i++){
    if( socketlist[i]['ipv4'] !== ipv4 || parseInt(socketlist[i]['port']) !== port){
        socketlist[i].on('ack', (data)=>{
           console.log(data);
        });
    }
}
for(let i = 0; i<socketlist.length; i++){
    if( socketlist[i]['ipv4'] !== ipv4 || parseInt(socketlist[i]['port']) !== port){
        socketlist[i].on('vote', (data)=>{
            integrityVote++;
            if(integrityVote>(totalpeer/2)){
                console.log("Blockchain is valid");
            }
        });
}
}
console.log(ipv4);

server.listen(port, ()=>{
    console.log("Server is UP *: "+port);
});
