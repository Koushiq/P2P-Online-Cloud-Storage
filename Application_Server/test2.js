const io = require('socket.io-client');


var socket = io.connect('http://192.168.0.102:5000');
var startTime; 
var targetTime;

var received ;

setInterval(function() {
  startTime = Date.now();
  received=false;
  targetTime=startTime+2000;
  socket.emit('ping');
  /* setTimeout(function(){
    if(received==false)
    {
        console.log('packet losss');
    }
    else
    {
        socket.emit('ping');
    }
  },2000); */
}, 2000);

socket.on('pong', function() {
  latency = Date.now() - startTime;
  received = true;
  console.log(latency);
}); 

