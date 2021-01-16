const express = require('express');
const app = express();
//const http = require('http').createServer();
var requ;

const cio = require('socket.io-client');
let socket = cio.connect('http://localhost:3000');
socket.on('server2client',(data)=>{
    console.log("Received from server: ", data);
    requ = data;
})
const cio2 = require('socket.io-client');
let socket2 = cio2.connect('http://localhost:3001');
socket2.on('client12other',(data)=>{
    console.log("Received from client: ", data);
})
const http = require('http').createServer();
const sio = require('socket.io')(http);
const port = 3002;

sio.on('connection', (socket2)=>{
    if(requ == "Need Approval")
    socket2.emit('client22other', "Client-2: Approved");
})

socket.on("sendblock", (obj)=>{
    console.log("BlockChain Received from Server: ");
    console.log( obj);
})
http.listen(port, ()=>{
    console.log("Client 2 is up! ");
})
