var clio = require('socket.io-client');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var blockchain = require('./blockChain');
let bcdata = [];
let port = 5002;
var fs = require('fs');
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
    socket.emit("message", "Peer2 Ready to add chain to the block!");
 });

 let sockets = JSON.parse(fs.readFileSync('../trackerlist.json'));
 let localtrackers = sockets;

 for(let i = 0; i<sockets.length; i++){
    if(parseInt(sockets[i]['port']) !== port){
        console.log(sockets[i]['port']);
        socketlist.push(clio.connect("http://"+sockets[i]['ipv4']+":"+sockets[i]['port']));
    }
}


for(let i = 0; i<socketlist.length; i++){
    if(localtrackers[i]['ipv4'] !== ipv4 || parseInt(localtrackers[i]['port']) !== port){
        socketlist[i].on('block', (data )=>{
            console.log("Received from server",data);
            queue.push(data);
            for( let i = 0; i<queue.length; i++){
                blockchain.blockAdd(queue.shift());
            }
        //blockchain.blockAdd(data);
        bcdata = blockchain.blockChainData();
        fs.writeFileSync('blockchain.json', JSON.stringify(bcdata, null, 4));

        io.on('connection', (socket)=>{
        socket.emit("ack","Peer-2 added block to the chain");
        io.emit('chaindata', bcdata);
    });

 });
    }
}

for(let i = 0; i<socketlist.length; i++){
    if(localtrackers[i]['ipv4'] !== ipv4 || parseInt(localtrackers[i]['port']) !== port){
        socketlist[i].on('chaindata', (data )=>{
            console.log("Received : "+JSON.stringify(data, null, 4));
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
    console.log("Peer-2 is up *: "+port);
})

