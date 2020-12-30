const http = require('http').createServer();
const server = require('socket.io')(http);
const io = require('socket.io-client');
const ipv4 = (require("ip")).address();

const client  = io("http://192.168.0.100:6000");
const serverPort=8000;

client.on('ping',function(message){

	let address={
		ip:ipv4,
		port:serverPort
	};
	console.log(message);
	client.emit('pong',address);
});


http.listen(serverPort,()=>{
	console.log("6000 port running");
});

