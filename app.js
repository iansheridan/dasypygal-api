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

app.get('/about', function(req, res){
  res.render('about', {
    title: 'DG API :: About'
  });
});

app.get('/post/:id', function(req, res){
  db.get(req.params.id, function (err, doc) {
    if (err) throw err;
    res.send(JSON.stringify(doc));
  });
});

app.del('/post/:id', function(req, res){
  db.remove(req.params.id, function (err, doc) {
    if (err) throw err;
    res.send(JSON.stringify(doc));
  });
});

// the object that is passed to this function should contain
//    title, string
//    body, string
//    user_id, string, EMAIL
//
// the other fields will be filled in
app.put('/post/:id', function(req, res){
  var newdoc = req.params.doc;
  newdoc['couchrest-type'] = 'Post';
  newdoc.slug = newdoc.title.replace(/ /g, "_").replace(/[^_\w]/g, "").replace(/_{2,}/g, "_").toLowerCase();
  newdoc.updated_at = new Date();
  db.save(newdoc, function (err, doc) {
    if (err) throw err;
    res.send(JSON.stringify(doc));
  });
});

// the object that is passed to this function should contain
//    title, string
//    body, string
//    user_id, string, EMAIL
//
// the other fields will be filled in
app.put('/post/new', function(req, res){
  var newdoc = req.params.doc;
  newdoc['couchrest-type'] = 'Post';
  newdoc.slug = newdoc.title.replace(/ /g, "_").replace(/[^_\w]/g, "").replace(/_{2,}/g, "_").toLowerCase();
  newdoc.created_at = new Date();
  newdoc.updated_at = new Date();
  db.save(newdoc, function (err, doc) {
    if (err) throw err;
    res.send(JSON.stringify(doc));
  });
});

app.get('/posts/date/:date', function(req, res){
  var query = { key: req.params.date, descending: true };
  db.view('Post/by_created_at', query, function(err, posts) {
    if (err) throw err;
    res.send(JSON.stringify(post.rows));
  });
});

app.get('/posts/page/:page', function(req, res){
  var limit = 5,
    skip = ((req.params.page - 1) * limit) + 1,
    query = { limit: limit, descending: true };
  if (skip > 1) query.skip = skip;
  db.view('Post/by_created_at', query, function(err, posts) {
    if (err) throw err;
    res.send(JSON.stringify(posts.rows));
  });
});

app.get('/posts/all', function(req, res){
  var query = { descending: true };
  db.view('Post/by_created_at', query, function(err, posts) {
    if (err) throw err;
    res.send(JSON.stringify(posts.rows));
  });
});

app.get('/posts', function(req, res){
  var limit = 5,
    query = { limit: limit, descending: true };
  db.view('Post/by_created_at', query, function(err, posts) {
    if (err) throw err;
    res.send(JSON.stringify(posts.rows));
  });
});

app.get('/sidebar/:id', function(req, res){
  db.view('Sidebar/by_id', { key: req.params.id }, function(err, post) {
    if (err) throw err;
    res.send(JSON.stringify(post.rows));
  });
});

app.get('/sidebars', function(req, res){
  var query = { descending: true };
  db.view('Sidebar/by_created_at', query, function(err, posts) {
    if (err) throw err;
    res.send(JSON.stringify(posts.rows));
  });
});

app.get('/user/:id', function(req, res){
  db.view('User/by_id', { key: req.params.id }, function(err, post) {
    if (err) throw err;
    res.send(JSON.stringify(post.rows));
  });
});

app.get('/users', function(req, res){
  var query = { descending: true };
  db.view('User/by_created_at', query, function(err, posts) {
    if (err) throw err;
    res.send(JSON.stringify(posts.rows));
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
