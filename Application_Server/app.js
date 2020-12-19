const http = require('http');
var express 	= require('express');
var bodyParser 	= require('body-parser');
var uploadController = require('./controllers/uploadController');
var trashboxController = require('./controllers/trashboxController');

var app = express();
const server = http.createServer(app);
const fileUpload = require('express-fileupload');

app.use(fileUpload());

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));

app.use('/upload', uploadController);
app.use('/trashbox',trashboxController);

app.get('/',function(req,res)
{
    res.redirect('/upload');

});

server.listen(3000, () => {
    console.log('Server running at 3000');
});