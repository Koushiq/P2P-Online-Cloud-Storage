const express = require('express');
const app = express();
const http = require('http').createServer();
var port = 3000;
const io = require('socket.io')(http);
const io2 = require('socket.io-client');
const io3 = require('socket.io-client');
var createIoPromise = require ('socket.io-promise');
const ioPromise = createIoPromise;

//const io4 = require('socket.io')(http);
const fs = require('fs');
var block = require('./blockchain');
var count = 0;
var bcdata = {};
var resArr = [];


let socket2 = io2.connect("http://localhost:3001");

socket2.on('client12other', (data)=>{
    console.log("Data Received from Client: ", data);
    if(data == "Client-1: Approved"){
         resArr.push(1);
    }
});

let socket3 = io3.connect("http://localhost:3002");

socket3.on('client22other', (data)=>{
    console.log("Data Received from Client: ", data);
    if(data == "Client-2: Approved"){
       resArr.push(1);
    }

});



io.on("connection", (socket) => {
    io.emit("server2client","Need Approval");
    console.log("Receiver Connected ");
});

http.listen(port, () => {

    console.log("Server is up at port: "+port);

        setTimeout(sendBC, 2000);
        //sendBC();
});

function sendBC(){

    console.log("Inside function a");
    console.log("Response Array:"+resArr.length);
    if(resArr.length === 2){
    let data = blockAdd();
    if(data != null){

        io.on("connection", (socket) => {
            io.emit("sendblock",bcdata);
            console.log("BC Sent! ");
        });

    }
    else{
        console.log("Data is null");
    }
}
else
{
    console.log("Not Everyone Permitted");
}
}


function blockAdd(){

    console.log("Adding Block");

block.blockAdd({FileName: "Anyfile", Author:"Sowvik",TimeStamp:"1/1/2021", Size:"500MB", Hash:"dsjfoiJKLJSLKJhflkzxnl85290sjdJFDSKL",Extension: ".mp3"});
block.blockAdd({FileName: "Test File", Author:"Mushfiq",TimeStamp:"1/5/2023", Size:"750MB", Hash:"dfgdgdfgdfsdvdfgnee534",Extension: ".ransomware"})
block.blockAdd({FileName: "Movie", Author:"Test",TimeStamp:"1/1/2021", Size:"500MB", Hash:"dfhhKHWDQIowieyoy(*Y*(y0394L", Extension: ".txt"})
//block.printBlockchain();
bcdata = block.blockChainData();

    return bcdata;

}



//var bcdata = block.blockChainData();



