// base web framework
var express = require('express');
var app = module.exports = express.createServer();

// DB interaction
var CouchClient = require('couch-client');
var db = CouchClient('http://dasypygal.dyndns.org:5984/blog');

var async = require('async');

// Logging
var logger = require('logger').create();
logger.level = 1;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'DG API'
  });
});

app.get('/posts/:date', function(req, res){
  db.view('Post/by_created_at', { key: req.params.date }, function(err, post) {
    if (err) throw err;
    res.send(JSON.stringify(post.rows));
  });
});

app.get('/posts', function(req, res){
  db.view('Post/by_created_at', function(err, posts) {
    if (err) throw err;
    res.send(JSON.stringify(posts.rows));
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
