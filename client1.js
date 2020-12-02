const io = require('socket.io-client');
const io3 = require('socket.io-client');

let socket = io.connect("http://localhost:3000");
console.log("Client Running....\n");

socket.on("server2client", (data)=>{
    console.log("Data Received: ",data);
})
let socket2 = io3.connect("http://localhost:3002");

socket2.on('client22other', (data)=>{
    console.log("Data Received from Client: ", data);
})

const http = require('http').createServer();
const io2 = require('socket.io')(http);
const express = require('express');
const app = express();

io2.on('connection', (socket2)=>{
    socket2.emit('client12other', "This message is from Client 1! ");
    console.log("Both way communication established!");
})

http.listen(3001,()=>{
    console.log("Client 1 is listening at 3001!");
})
