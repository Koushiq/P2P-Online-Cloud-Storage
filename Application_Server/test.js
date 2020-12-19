const io = require('socket.io-client');


var socket = io.connect('http://192.168.0.102:5000');
var startTime;

setInterval(function() {
  startTime = Date.now();
  socket.emit('ping');
}, 2000);

socket.on('pong', function() {
  latency = Date.now() - startTime;
  console.log(latency);
});