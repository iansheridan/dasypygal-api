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

// Functions

function getPosts(){
  var found_posts = new Array();
  db.view('/blog/_design/Post/_view/by_created_at', function(err, posts) {
    if (err) throw err;
    async.forEachSeries(posts.rows,function(item,callback){
      db.get(item.id,function(err,doc) {
        if (err) return callback(err);
        found_posts.push(doc);
        callback(null);
      });
    },function(err){
      if (err) throw err;
      return JSON.stringify(found_posts);
    });
  });
}

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'DG API'
  });
});

app.get('/posts', function(req, res){
  res.send(getPosts());
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
