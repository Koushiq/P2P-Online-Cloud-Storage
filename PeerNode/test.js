const http = require('http').createServer();
const server = require('socket.io')(http);
const io = require('socket.io-client');
const ipv4 = (require("ip")).address();
const fs = require('fs');
const client = io.connect("http://192.168.0.100:3000");
const serverPort=6000;
let socketList=[];
let voteList=[];
const {Block , Blockchain}  = require('./blockchain.js');
let globalNeighbourChain = [];
let localTrackers=[];
let postVoteCount= 0;
let negativeVoteCount = 0;
let date = new Date().toISOString().
  replace(/T/, ' ').     
  replace(/\..+/, '');

client.on('ping',function(message){

	let address={
		ip:ipv4,
		port:serverPort
	};
	console.log(message);
	client.emit('pong',address);

});

client.on('getTracker',function(globalTracker){
	
	fs.writeFileSync('trackers.json',JSON.stringify(globalTracker,null,4));
	localTrackers = JSON.parse(fs.readFileSync('trackers.json'));

	for(let i=0;i<localTrackers.length;i++)
	{
		socketList.push(io.connect('http://'+localTrackers[i]['ipv4']+":"+localTrackers[i]['port']));
	}

});

server.on('connection',function(socket){
	
	console.log('new connection');
	socket.emit('promtFile','start sending file');
	//let localTrackers = JSON.parse(fs.readFileSync('trackers.json'));

	socket.on('sendFileMetaData',function(fileMetaData){
		
		//socket.emit("metaData", fileMetaData);
		//console.log('inside sendFileMetaData = >',fileMetaData);
		let localChain = new Blockchain();
		localChain.initLocalChain();
		console.log('localchain before push ',localChain);
		localChain.addBlock(new Block(date,fileMetaData));
		console.log('Local Chain => ',localChain);
		//socket.emit('sendBlockChain',localChain);
		for(let i=0;i<socketList.length;i++)
		{
			socketList[i].emit('sendBlockChain',localChain);
		}
		console.log('inside sendFileMetaData  local chain emmited');
	}); 

	socket.on('sendBlockChain',function(neighbourChain){

		globalNeighbourChain=new Blockchain();
		globalNeighbourChain.initChainFromDataSrc(neighbourChain);
		//console.log()
		console.log('Global Chain = >  ',globalNeighbourChain);
		let localChain = new Blockchain();
		localChain.initLocalChain();
		localChain.addBlock(globalNeighbourChain.getLatestBlock());
		console.log('Local Chain = >  ',localChain);
		
		let vote={};
		vote['ipv4']=ipv4;
		vote['port']=serverPort;
		//console.log('local chain ',localChain);
		//console.log('neighbour chain ',globalNeighbourChain);
		if(Blockchain.isBothChainIdentical(localChain,globalNeighbourChain))
		{
			vote['answer']=true;
		}
		else
		{
			vote['answer']=false;
		}

		//socket.emit('vote',vote);
		for(let i=0;i<socketList.length;i++)
		{
			socketList[i].emit('vote',vote);
		}

	});

	socket.on('vote',function(vote){
		voteList.push(vote);
		console.log('votes');
		console.log(voteList);

		if(voteList.length==localTrackers.length)
		{
			for(let i=0;i<voteList.length;i++)
			{
				if(voteList[i]['answer'])
				{
					postVoteCount++;
				}
				else
				{
					negativeVoteCount++;
				}
			}
			console.log('global blockchain before writing ',globalNeighbourChain);
			if(postVoteCount>(localTrackers.length/2))
			{
				fs.writeFileSync('blockchain.json',JSON.stringify(globalNeighbourChain,null,4));
			}
			else{
				console.log('Invalid Blockchain received');
			}
			postVoteCount=0;
			negativeVoteCount=0;
			voteList=[];
		}
	});
	

	socket.on('processFile',function(fileObject){
	
	
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
				for(let i=0;i<socketList.length;i++)
				{
					//console.log('ipv4 = '+ipv4+' localTrackers[i][ipv4]='+localTrackers[i%localTrackers.length]['ipv4']);
					//console.log('serverport = '+serverPort+' localTrackers[i][port]= '+localTrackers[i%localTrackers.length]['port'] );
					if(ipv4!=localTrackers[i%localTrackers.length]['ipv4'] || serverPort!=localTrackers[i%localTrackers.length]['port'])
					{
						console.log('I am here',localTrackers[i%localTrackers.length]['ipv4']);
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
	console.log(serverPort+" port running");
});
