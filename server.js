const express = require('express');
const app = express();
const http = require('http').createServer();
var port = 3000;
const io = require('socket.io')(http);
const io2 = require('socket.io-client');
const io3 = require('socket.io-client');
const fs = require('fs');

let socket2 = io2.connect("http://localhost:3001");

socket2.on('client12other', (data)=>{
    console.log("Data Received from Client: ", data);
})

let socket3 = io3.connect("http://localhost:3002");

socket3.on('client22other', (data)=>{
    console.log("Data Received from Client: ", data);
})

io.on("connection", (socket) => {
   //var readStream = fs.createReadStream(path.resolve(__dirname+'./serverimage.jpg'));
    socket.emit("server2client", "This Message is from Server");
    console.log("Receiver Connected ");
})

http.listen(port, () => {
    console.log("Server is up at port: "+port);
})
