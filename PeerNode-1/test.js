const http = require('http').createServer();
const server = require('socket.io')(http);
const io = require('socket.io-client');
//^Create socket server
const ipv4 = (require("ip")).address(); //Get ipv4 of current host in local network
const fs = require('fs');
const client = io.connect("http://192.168.1.101:3000"); //connect to specific client(ipv4:port)
const serverPort=6000; //Define host port
let socketList=[]; //Initialize socket list
let voteList=[]; //Initialize vote container
const {Block , Blockchain}  = require('./blockchain.js'); //Import Block and Blockchain classes
let globalNeighbourChain = []; //Initialize array for containing blockchain from a neighbour network
let localTrackers=[]; //Initialize array to contain trackers from localhost
let postVoteCount= 0; //Initialize vote count
let negativeVoteCount = 0;
let date = new Date().toISOString().
  replace(/T/, ' ').
  replace(/\..+/, ''); //get current date

client.on('ping',function(message){ //Listen for ping event

	let address={ //bind IPV4 and port to address object
		ip:ipv4,
		port:serverPort
	};
	console.log(message);
	client.emit('pong',address); //Emit response for ping

});

//After connecting to app server our hosts will firstly listen for a event and first event he will get in response is the getTracker event
client.on('getTracker',function(globalTracker){ //Listening to get tracker event, host will receive updated tracker list

	fs.writeFileSync('trackers.json',JSON.stringify(globalTracker,null,4)); //Update local tracker with received tracker from app server
	localTrackers = JSON.parse(fs.readFileSync('trackers.json')); //After local tracker has been updated, we will get localTracker in memory

	for(let i=0;i<localTrackers.length;i++) //Iterate over local tracker
	{
		socketList.push(io.connect('http://'+localTrackers[i]['ipv4']+":"+localTrackers[i]['port'])); //Add connection instances to socket list
	}

});


server.on('connection',function(socket){ //Listen for new connection

	console.log('new connection');
	socket.emit('promtFile','start sending file'); //emit promptfile event (This event will let the connected hosts know that they are to be ready to receive a file )
	//let localTrackers = JSON.parse(fs.readFileSync('trackers.json'));

	socket.on('sendFileMetaData',function(fileMetaData){ //Listen for sendfile metadata.

		//socket.emit("metaData", fileMetaData);
		//console.log('inside sendFileMetaData = >',fileMetaData);
		let localChain = new Blockchain(); //Create blockchain instance
		localChain.initLocalChain(); //Initialize local blockchain from blockchain.json
		console.log('localchain before push ',localChain);
		localChain.addBlock(new Block(date,fileMetaData)); //Mine new block (New block contains the uploaded file metadata)
		console.log('Local Chain => ',localChain);
		//socket.emit('sendBlockChain',localChain);
		for(let i=0;i<socketList.length;i++) //Iterate socketList
		{
			socketList[i].emit('sendBlockChain',localChain); //Send local blockchain with new block to all the neighbour nodes
		}
		console.log('inside sendFileMetaData  local chain emmited');
	});

	socket.on('sendBlockChain',function(neighbourChain){ //Listen for receiving incoming blockchain from neighbour nodes

		globalNeighbourChain=new Blockchain(); //Create blockchain instance
		globalNeighbourChain.initChainFromDataSrc(neighbourChain); //Initialize blockchain from received source
		//console.log()
		console.log('Global Chain = >  ',globalNeighbourChain);
		let localChain = new Blockchain(); //Create instance for local blockchain
		localChain.initLocalChain(); //Initialize local chain
		localChain.addBlock(globalNeighbourChain.getLatestBlock()); //Add last block from global chain to local chain
		console.log('Local Chain = >  ',localChain);

		let vote={}; //Define vote object
		vote['ipv4']=ipv4; //Define voter address
		vote['port']=serverPort; //Define voter port
		//console.log('local chain ',localChain);
		//console.log('neighbour chain ',globalNeighbourChain);
		if(Blockchain.isBothChainIdentical(localChain,globalNeighbourChain)) //match local chain with global chain
		{
			vote['answer']=true; //if both chains match, set vote to true
		}
		else
		{
			vote['answer']=false; //else set vote to false
		}

		//socket.emit('vote',vote);
		for(let i=0;i<socketList.length;i++) //Iterate socket list
		{
			socketList[i].emit('vote',vote); //Send vote instance of localhost to all peers from local tracker
		}

	});

	socket.on('vote',function(vote){ //Listen and receive for vote event
		voteList.push(vote); //Add vote object to vote list
		console.log('votes');
		console.log(voteList);

		if(voteList.length==localTrackers.length) //check if every node in local tracker has participated in voting
		{
			for(let i=0;i<voteList.length;i++) //Iterate vote list
			{
				if(voteList[i]['answer']) //Count positive vote
				{
					postVoteCount++;
				}
				else //Count negative vote
				{
					negativeVoteCount++;
				}
			}
			console.log('global blockchain before writing ',globalNeighbourChain);
			if(postVoteCount>(localTrackers.length/2)) //check positive vote greater than 50%
			{
				fs.writeFileSync('blockchain.json',JSON.stringify(globalNeighbourChain,null,4)); //if yes, update blockchain with received blockchain
			}
			else{
				console.log('Invalid Blockchain received'); //otherwise mention invalid blockchain received
			}
			postVoteCount=0; //Reset
			negativeVoteCount=0; //Reset
			voteList=[]; //Reset
		}
	});


	socket.on('processFile',function(fileObject){ //Listen for process file event


		let fileName = fileObject['filename']; //Assign file name from received file object
		 fileName=fileName.split('.'); //Split extension and get file name

		if (!fs.existsSync('files/'+fileName[0])){ //check if directory exists
		    fs.mkdirSync('files/'+fileName[0]); //if not, create
		}
		fs.writeFile('files/'+fileName[0]+'/'+fileObject['filename'],fileObject['buffer'],(err)=>{ //Write file buffer to disc with associated path
			console.log('error is ',err);
			if(err==null || err==undefined) //If no error occured
			{
				socket.emit('processed',fileObject['filename']+' proccesing is done'); //send event for successfully writing file to disc
				for(let i=0;i<socketList.length;i++) //iterate socket list
				{
					//console.log('ipv4 = '+ipv4+' localTrackers[i][ipv4]='+localTrackers[i%localTrackers.length]['ipv4']);
					//console.log('serverport = '+serverPort+' localTrackers[i][port]= '+localTrackers[i%localTrackers.length]['port'] );
					if(ipv4!=localTrackers[i%localTrackers.length]['ipv4'] || serverPort!=localTrackers[i%localTrackers.length]['port']) //Check if current socket instance is not localhost
					{
						console.log('I am here',localTrackers[i%localTrackers.length]['ipv4']);
						socketList[i].emit('sendFileToPeerNodes',fileObject); //send file object to current socket
					}
				}

			}
		});
	});

	socket.on('sendFileToPeerNodes',function(fileObject){ //Listen for incoming file object event
		let fileName = fileObject['filename']; //Assign file name
		 fileName=fileName.split('.'); //Get file name

		if (!fs.existsSync('files/'+fileName[0])){ //Create directory if doesn't exists
		    fs.mkdirSync('files/'+fileName[0]);
		}

		fs.writeFile('files/'+fileName[0]+'/'+fileObject['filename'],fileObject['buffer'],(err)=>{ //write file to disc with associate path
			console.log('error is ',err);
			if(err==null || err==undefined)
			{

			}
		});
	});


	socket.on('retriveFile',function(message){ //Listen for file retrieving event (Purpose of this event is to download files)

		console.log('inside serversocket');
		console.log(message);
		let dirname=message.split('.'); //get directory from file name
		fs.readFile('files/'+dirname[0]+'/'+message,(err, data) =>{ //read file from associate path

		  if (err) throw err;
		  console.log(data);
		  let fileObj = {}; // define file object
		  fileObj['filename']=message; //bind file name
		  fileObj['buffer']=data; //bind file buffer
		  socket.emit('filedata',fileObj); //broadcast file buffer to all connected nodes

		});
	});

});

http.listen(serverPort,()=>{ 
	console.log(serverPort+" port running");
});
