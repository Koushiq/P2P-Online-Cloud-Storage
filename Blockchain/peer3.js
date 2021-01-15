var clio = require('socket.io-client');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var socket1 = clio.connect("http://localhost:3000");
var socket2 = clio.connect("http://localhost:3001")
var socket3 = clio.connect("http://localhost:3002")
var blockchain = require('./blockChain');
var fs = require('fs');

io.on('connection', (socket)=>{
    socket.emit("peer3message", "Peer3 sent a message")
 });

socket1.on("servermessage", (data)=>{
    console.log("Received from server: "+data);
});
socket1.on("block", (data)=>{
    blockchain.blockAdd(data);
    fs.writeFileSync('blockchain.json', JSON.stringify(blockchain.blockChainData(), null, 2));
    io.on('connection', (socket)=>{
        socket.emit("ack","Peer-3 added block to the chain");
    });
});

socket2.on("peer1message", (data)=>{
    console.log("Received from Peer-1: "+data);
});
socket3.on("peer2message", (data)=>{
    console.log("Received from Peer-2: "+data);
});

socket2.on("ack", (data)=>{
    console.log("Received from Peer-1: "+data);
});
socket3.on("ack", (data)=>{
    console.log("Received from Peer-2: "+data);
});

server.listen(3003, ()=>{
    console.log("Peer-3 is up *: 3003");
})

