const http = require('http');
var express 	= require('express');
var bodyParser 	= require('body-parser');
var uploadController = require('./controllers/uploadController');
var trashboxController = require('./controllers/trashboxController');
const fs = require('fs');

var app = express();
const server = http.createServer(app);
const socketServer = require('socket.io')(server);
const fileUpload = require('express-fileupload');
const { fstat } = require('fs');

app.use(fileUpload());

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));



app.use('/upload', uploadController);
app.use('/trashbox',trashboxController);

app.get('/',function(req,res)
{
    res.redirect('/upload');

});



//let port = process.env["PORT"];
let port =3000;
server.listen(port, () => {
    
    console.log('Server running at '+port);
});


socketServer.on('connection',function(socket){
    let globalTrackers = JSON.parse(fs.readFileSync('trackers.json'));
    socket.emit('getTracker',globalTrackers);
});