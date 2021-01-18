var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var clio = require('socket.io-client');
var socket1 = clio.connect("http://localhost:3001"); //5000 series
var socket2 = clio.connect("http://localhost:3002");
var socket3 = clio.connect("http://localhost:3003");
let blockchain = require('./blockChain');
let fs = require('fs');
let port = 5005;

socket1.on('block', (data)=>{
    blockchain.blockAdd(data);
    console.log("Block Added by Peer1");
});
socket2.on('block', (data)=>{
    blockchain.blockAdd(data);
    console.log("Block Added by Peer2");
});
socket3.on('block', (data)=>{
    blockchain.blockAdd(data);
    console.log("Block Added by Peer3");
});

setInterval(()=>{
    fs.writeFileSync('blockchain.json', JSON.stringify(blockchain.blockChainData(), null, 2));
}, 300);

server.listen(port, ()=>{
    console.log("Server is up *:"+port);
})