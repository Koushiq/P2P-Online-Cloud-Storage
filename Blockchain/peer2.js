var clio = require('socket.io-client');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var socket1 = clio.connect("http://localhost:3000");
var socket2 = clio.connect("http://localhost:3001")
var socket3 = clio.connect("http://localhost:3003")
var blockchain = require('./blockChain');

var fs = require('fs');

io.on('connection', (socket)=>{
    socket.emit("peer2message", "Peer2 sent a message")
 });

socket1.on("servermessage", (data)=>{
    console.log("Received from Server: "+data);
});

socket1.on("block", (data)=>{
    blockchain.blockAdd(data);
    fs.writeFileSync('blockchain.json', JSON.stringify(blockchain.blockChainData(), null, 2));
    io.on('connection', (socket)=>{
        socket.emit("ack","Peer-2 added block to the chain");
    });
});

socket2.on("peer1message", (data)=>{
    console.log("Received from Peer-1: "+data);
});
socket3.on("peer3message", (data)=>{
    console.log("Received from Peer-3: "+data);
});
socket2.on("ack", (data)=>{
    console.log("Received from Peer-1: "+data);
});
socket3.on("ack", (data)=>{
    console.log("Received from Peer-3: "+data);
});

server.listen(3002, ()=>{
    console.log("Peer-2 is up *: 3002");
})

