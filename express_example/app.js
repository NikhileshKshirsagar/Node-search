
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

/*var result = '';
var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'nikhilesh',
	database : 'Appraisal'
});

connection.connect();
*/
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
		//console.log(nodezooresult);
		nodezooresult = {};
		
		nodezooresult = result;
		//console.log(nodezooresult);
		renderCall(nodezooresult, searchString,req, res);
	});
}

function render(result, notification, req, res) {
	console.log('In renderCall');
	res.render('index', {
		title : 'NODE SEARCH',
		searchtext : req.body.search,
		nodezooresult : JSON.stringify(result),
		notification : notification
	});
}

function GraphInsert(objNodeResult, searchString, req, res){
	console.log('Inside GraphInsert');

	objNodeResult.items.forEach(function(item){
		var node = db.createNode({
			ModuleName: item['name'], 
			desc: item['desc'],
			latest : item['latest'],
			maints : item['maints'], 
			sitelink : item['site'],
			githublink : item['git'],
			rank : item['rank'],
			score : item['score'],
			nr : item['nr'],
			nodename : searchString
		}); 

			node.save(function (err, node) {    // ...this is what actually persists.
			if (err) {
				console.err('Error saving new node to database:', err);
			} else {
			console.log('Node saved to database with id:', node.id);
			}
		});
	});
	render(objNodeResult, 'Result saved successfully to Graph database', req, res);
}

function ElasticInsert(objNodeResult, searchString, req, res){
        console.log('Inside ElasticInsert');
	i=0;

	objNodeResult.items.forEach(function(item){
		i++;
		
	client.create({
		  index: 'nodezoo',
		  type: 'npm',
		  body: {
		    ModuleName: item['name'],
                        desc: item['desc'],
                        latest : item['latest'],
                        maints : item['maints'],
                        sitelink : item['site'],
                        githublink : item['git'],
                        rank : item['rank'],
                        score : item['score'],
                        nr : item['nr'],
                        nodename : searchString
			}
		}, function (error, response) {
		  // ...
			console.log("Saved: "+i);
		});
	});

    render(objNodeResult, 'Result saved successfully to elastic database', req, res);
}


     

app.post('/graphsave', function(req,res){
	getnodezoodata(req.body.search, GraphInsert, req, res);
	console.log('Inside graphsave');
});


app.get('/', function(req, res){
	res.render('index', {
		title : 'NODE SEARCH',
		//nodezooresult : JSON.stringify(nodezooresult)
	});
});
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

app.post('/', function(req, res){
	console.log('In POST');
	console.log(req.body);
	if(req.body.actionParam == 'search')
	{
		console.log('SEARCH');
		getnodezoodata(req.body.search, render, req, res);
	}
	else if(req.body.actionParam == 'graphdb')
	{
		console.log('GRAPH INSERT');
		getnodezoodata(req.body.search, GraphInsert, req, res);
	}
	else if(req.body.actionParam == 'elastic')
	{
	  	getnodezoodata(req.body.search, ElasticInsert, req, res);
	}
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
