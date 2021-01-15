var clio = require('socket.io-client');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var socket1 = clio.connect("http://localhost:3000");
var socket2 = clio.connect("http://localhost:3002")
var socket3 = clio.connect("http://localhost:3003")
var blockchain = require('./blockChain');
var fs = require('fs');

io.on('connection', (socket)=>{
   socket.emit("peer1message", "Peer1 Ready to add chain to the block")
});

socket1.on("servermessage", (data)=>{
    console.log("Received from server: "+data);
});

socket1.on("block", (data)=>{
    blockchain.blockAdd(data);
    fs.writeFileSync('blockchain.json', JSON.stringify(blockchain.blockChainData(), null, 2));
    io.on('connection', (socket)=>{
        socket.emit("ack","Peer-1 added block to the chain");
    });
});

socket2.on("peer2message", (data)=>{
    console.log("Received from Peer-2: "+data);
});

socket2.on("ack", (data)=>{
    console.log("Received from Peer-2: "+data);
});


socket3.on("peer3message", (data)=>{
    console.log("Received from Peer-3: "+data);
});
socket3.on("ack", (data)=>{
    console.log("Received from Peer-3: "+data);
});

server.listen(3001, ()=>{
    console.log("Peer-1 is up *: 3001");
})