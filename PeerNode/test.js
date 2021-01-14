const http = require('http').createServer();
const server = require('socket.io')(http);
const io = require('socket.io-client');
const ipv4 = (require("ip")).address();
const fs = require('fs');
const client = io.connect("http://192.168.0.100:3000");
const serverPort=6000;
let socketList=[];
//console.log(client.socket.sessionid);

client.on('ping',function(message){

	//console.log(client.id);
	let address={
		ip:ipv4,
		port:serverPort
	};
	console.log(message);
	client.emit('pong',address);
});

client.on('getTracker',function(globalTracker){
	//console.log(globalTracker);
	fs.writeFileSync('trackers.json',JSON.stringify(globalTracker,null,4));
	let localTrackers = JSON.parse(fs.readFileSync('trackers.json'));
	
	for(let i=0;i<localTrackers.length;i++)
	{
		//console.log('http://'+localTrackers[i]['ipv4']+":"+localTrackers[i]['port']);
		socketList.push(io.connect('http://'+localTrackers[i]['ipv4']+":"+localTrackers[i]['port']));
	}
	
});


client.on('sendFileToPeerNodes',function(fileObject){
		let fileName = fileObject['filename'];
		 fileName=fileName.split('.');
		
		if (!fs.existsSync('files/'+fileName[0])){
		    fs.mkdirSync('files/'+fileName[0]);
		}
		
		fs.writeFile('files/'+fileName[0]+'/'+fileObject['filename'],fileObject['buffer'],(err)=>{
			console.log('error is ',err);
			if(err==null || err==undefined)
			{
				//socket.emit('processed',fileObject['filename']+' proccesing is done');
				
			}
		});
	});



server.on('connection',function(socket){
	//socket.emit('promtDownload','begin download');
	
	//socket.emit('downloadFileHash','random');
	console.log('new connection');
	socket.emit('promtFile','start sending file');
	let localTrackers = JSON.parse(fs.readFileSync('trackers.json'));
	//console.log(localTrackers);
	socket.on('processFile',function(fileObject){
	
		//console.log('inside process files');
		//console.log(fileObject);
		//socket.emit('processed','done processing');
		let fileName = fileObject['filename'];
		 fileName=fileName.split('.');
		
		if (!fs.existsSync('files/'+fileName[0])){
		    fs.mkdirSync('files/'+fileName[0]);
		}
		
		fs.writeFile('files/'+fileName[0]+'/'+fileObject['filename'],fileObject['buffer'],(err)=>{
			console.log('error is ',err);
			if(err==null || err==undefined)
			{
				socket.emit('processed',fileObject['filename']+' proccesing is done');
				//console.log('localtrackers inside write ',localTrackers);
				//socket.broadcast.emit("sendFileToPeerNodes", fileObject);
				for(let i=0;i<socketList.length;i++)
				{
					console.log('ipv4 = '+ipv4+' localTrackers[i][ipv4]='+localTrackers[i]['ipv4']);
					if(ipv4!=localTrackers[i]['ipv4'])
					{
						console.log('I am here',localTrackers[i]['ipv4']);
						socketList[i].emit('sendFileToPeerNodes',fileObject);
					}
					
				}

			}
		});
	});
	
	socket.on('sendFileToPeerNodes',function(fileObject){
		let fileName = fileObject['filename'];
		 fileName=fileName.split('.');
		
		if (!fs.existsSync('files/'+fileName[0])){
			fs.mkdirSync('files/'+fileName[0]);
		}
		
		fs.writeFile('files/'+fileName[0]+'/'+fileObject['filename'],fileObject['buffer'],(err)=>{
			console.log('error is ',err);
			if(err==null || err==undefined)
			{
				//socket.emit('processed',fileObject['filename']+' proccesing is done');
			}
		});
	});
	
	
	socket.on('retriveFile',function(message){
		
		console.log('inside serversocket');
		console.log(message);
		let dirname=message.split('.');
		fs.readFile('files/'+dirname[0]+'/'+message,(err, data) =>{
			
		  if (err) throw err;
		  console.log(data);
		  let fileObj = {};
		  fileObj['filename']=message;
		  fileObj['buffer']=data;
		  socket.emit('filedata',fileObj);
		  
		});
	});
	
});






http.listen(serverPort,()=>{
	console.log("6000 port running");
});





//

