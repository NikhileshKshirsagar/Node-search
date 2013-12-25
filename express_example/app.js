
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var result = '';
var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'nikhilesh',
	database : 'Appraisal'
});

connection.connect();

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://localhost:7474');


//
//var objuser_details = {};
//var objjson = {};
//connection.query('Select * from user_details', function(err, rows, fields){
//	if(err) throw err;
//	
//	for (r in rows)
//	{
//		//console.log(r);
//		
//		/*console.log(rows[r]['firstname']);
//		console.log(rows[r]['lastname']);
//		console.log(rows[r]['username']);
//		console.log(rows[r]['password']);*/
//		objuser_details = {};
//		objuser_details = {
//			"firstname" : rows[r]['firstname'],
//			"lastname" : rows[r]['lastname'],
//			"username" : rows[r]['username'],
//			"password" : rows[r]['password']
//		};
//		
//		var node = db.createNode({firstname: rows[r]['firstname'], 
//								lastname : rows[r]['lastname'],
//								username : rows[r]['username'],
//								password : rows[r]['password']}); 
//
//		node.save(function (err, node) {    // ...this is what actually persists.
//		    if (err) {
//		        console.err('Error saving new node to database:', err);
//		    } else {
//		        //console.log('Node saved to database with id:', node.id);
//		    }
//		});
//		
//		objjson[r] = objuser_details;
//	}
//	//console.log(objjson);
//});

//var a = JSON.stringify(objjson);

//console.log(JSON.stringify(objjson));
//app.get('/', routes.index);

//app.get('/users', user.list);

var nodezoo = require('nodezoo')();
var nodezooresult = {};

nodezoo.query({q : 'node'}, function(err, result){
	nodezooresult = result;
	//console.log(nodezooresult);
});

function getnodezoodata(searchString, renderCall,req, res){
	console.log('In getnodezoodata');
	nodezoo.query({q : searchString }, function(err, result){
		console.log(nodezooresult);
		nodezooresult = {};
		
		nodezooresult = result;
		console.log(nodezooresult);
		renderCall(JSON.stringify(nodezooresult), req, res);
	});
}

function renderCall(result, req, res) {
	console.log('In renderCall');
	res.render('index', {
		title : 'NODE MODULE SEARCH',
		searchtext : req.body.search,
		nodezooresult : result
	});
}

app.post('/', function(req, res){
	console.log('In POST');
	//console.log(nodezooresult);
	//console.log(req.body.search);
	getnodezoodata(req.body.search, renderCall, req, res);
	
});

app.post('/graphsave', function(req,res){
	
});


app.get('/', function(req, res){
	res.render('index', {
		title : 'NODE MODULE SEARCH',
		//nodezooresult : JSON.stringify(nodezooresult)
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
