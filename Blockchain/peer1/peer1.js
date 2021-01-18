var clio = require('socket.io-client');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
let blockchain = require('./blockChain');
var fs = require('fs');
let bcdata = [];
let port = 5001;
let socketlist=[];
const ipv4 = (require("ip")).address();
let vote = 0;

let queue = [];


function isChainValid(bcdata){
    for(let i = 1; i<bcdata.length; i++){
        const currentBlock = bcdata[i];
        const previousBlock = bcdata[i-1];
        if(previousBlock.hash !== currentBlock.prevHash){
            return false;
        }
        if(currentBlock.prevHash !== previousBlock.hash){
            return false;
        }
    }
    return true;
}

io.on('connection', (socket)=>{
    socket.emit("message", "Peer1 Ready to add chain to the block!");
 });

 let sockets = JSON.parse(fs.readFileSync('../trackerlist.json'));
 let localtrackers = sockets;

 for(let i = 0; i<sockets.length; i++){
    if(parseInt(sockets[i]['port']) !== port){
        socketlist.push(clio.connect("http://"+sockets[i]['ipv4']+":"+sockets[i]['port']));
    }
}

//Receive Block directly from application server:

for(let i = 0; i<socketlist.length; i++){
    if(localtrackers[i]['ipv4'] !== ipv4 || parseInt(localtrackers[i]['port']) !== port){
        socketlist[i].on('block', (data )=>{
        console.log("Received from server",data);
        queue.push(data);
        for( let i = 0; i<queue.length; i++){
            blockchain.blockAdd(queue.shift());
        }

        bcdata = blockchain.blockChainData();
        fs.writeFileSync('blockchain.json', JSON.stringify(bcdata, null, 4));

        io.on('connection', (socket)=>{
        socket.emit("ack","Peer-1 added block to the chain");
        io.emit('chaindata', bcdata);
    });

 });
    }
}

//Receive block from other peer nodes!

for(let i = 0; i<socketlist.length; i++){
    if(localtrackers[i]['ipv4'] !== ipv4 || parseInt(localtrackers[i]['port']) !== port){
        socketlist[i].on('chaindata', (data )=>{
            console.log("Received : "+JSON.stringify(data));
            bcdata = data;
        if(isChainValid(bcdata)){
            fs.writeFileSync('blockchain.json', JSON.stringify(bcdata, null, 4));
            vote++;
            io.on('connection', (socket)=>{
                io.emit('vote', vote);
            })
        }
    else{
        console.log("Blockchain Tempered");
    }
        });
    }
}






















server.listen(port, ()=>{
    console.log("Peer-1 is up *: "+port);
})
