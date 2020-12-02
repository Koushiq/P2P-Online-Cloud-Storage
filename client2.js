const express = require('express');
const app = express();
//const http = require('http').createServer();

const cio = require('socket.io-client');
let socket = cio.connect('http://localhost:3000');
socket.on('server2client',(data)=>{
    console.log("Received from server: ", data);
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
    socket2.emit("client22other", "This message is from client 2!");
})
http.listen(port, ()=>{
    console.log("Client 2 is up! ");
})
