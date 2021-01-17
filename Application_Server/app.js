const http = require('http');
let express 	= require('express');
let bodyParser 	= require('body-parser');
let uploadController = require('./controllers/uploadController');
let trashboxController = require('./controllers/trashboxController');
let downloadController = require('./controllers/downloadController');
const fs = require('fs');

let app = express();
const server = http.createServer(app);
const socketServer = require('socket.io')(server);
const fileUpload = require('express-fileupload');


app.use(fileUpload());

app.set('view engine', 'ejs');
app.use('/upload/download/',express.static('downloaded'));
app.use('/downloaded',express.static('downloaded'));

app.use(bodyParser.urlencoded({extended: false}));



app.use('/upload', uploadController);
app.use('/trashbox',trashboxController);
app.use('/downloadFile',downloadController);
app.use(express.static('downloaded'));

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