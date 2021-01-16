const io = require('socket.io-client');
const io3 = require('socket.io-client');
var request;

let socket = io.connect("http://localhost:3000");
console.log("Client Running....\n");

socket.once("server2client", (data)=>{
    console.log("Data Received from Server: ",data);
    request = data;
})
let socket2 = io3.connect("http://localhost:3002");

socket2.once('client22other', (data)=>{
    console.log("Data Received from Client: ", data);
})

const http = require('http').createServer();
const io2 = require('socket.io')(http);
const express = require('express');
const app = express();

io2.on('connection', (socket2)=>{
    if(request == "Need Approval")
    socket2.emit('client12other', "Client-1: Approved");

    //console.log("Client-1 Approved Request to Add chain");
})

socket.on("sendblock", (obj)=>{
    console.log("BlockChain Received from Server: ");
    console.log( obj);
})

http.listen(3001,()=>{
    console.log("Client 1 is listening at 3001!");
})
