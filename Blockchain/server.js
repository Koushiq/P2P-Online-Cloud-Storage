var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var clio = require('socket.io-client');
var socket1 = clio.connect("http://localhost:3001");
var socket2 = clio.connect("http://localhost:3002")
var socket3 = clio.connect("http://localhost:3003")
var socketIDs = [];

function isEmpty(arg) {
    for (var item in arg) {
      return false;
    }
    return true;
  }

var list ={FileName: "Anyfile", Author:"Sowvik",TimeStamp:"1/1/2021", Size:"500MB", Hash:"dsjfoiJKLJSLKJhflkzxnl85290sjdJFDSKL",Extension: ".mp3"}




io.on('connection', (socket)=> {

    socketIDs.push(socket.id);
    socket.emit('servermessage', "This message is from server");
});

socket1.on("peer1message", (data)=>{
    console.log("Received from Peer-1: "+data);
});
socket2.on("peer2message", (data)=>{
    console.log("Received from Peer-2: "+data);
});

socket3.on("peer3message", (data)=>{
    console.log("Received from Peer-3: "+data);
});

socket1.on("ack", (data)=>{
    console.log("Received from Peer-1: "+data);
});
socket2.on("ack", (data)=>{
    console.log("Received from Peer-2: "+data);
});

socket3.on("ack", (data)=>{
    console.log("Received from Peer-3: "+data);
});

server.listen(3000, ()=>{
    console.log("Server is UP *: 3000");
})

setTimeout(()=>{
    io.on('connection', ()=>{
        console.log("Socket ID: "+socketIDs[0]);
        io.to(socketIDs[0]).emit('block',list);
    })
}, 300)