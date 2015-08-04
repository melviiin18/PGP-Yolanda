
var port = 8080;
var express = require('express');
var app = express();
var authRouter = express.Router();
var apiRouter = express.Router();

// define location fo static files
var staticDir = __dirname// + '/App';


// use body-parser to parse post contents
var bodyParser = require('body-parser');
app.use(bodyParser());

// configure to server static contents
app.use(express.static(staticDir));


/************************
 *
 *     OTHER ROUTES
 *
 ************************/


app.get('/drrm/drrm', function(req, res){     
	res.sendfile(staticDir + '/index.html')    	
});

// start the server
var server = app.listen(process.env.PORT, function(){
	
});



var host = process.env.PORT ? '0.0.0.0' : '127.0.0.1';
var port = process.env.PORT || 3000;

var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    //requireHeader: ['origin', 'x-requested-with'],
   // removeHeaders: ['cookie', 'cookie2']
}).listen('3000', host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
}); 
 

