var CouchClient = require('couch-client')
var fs = require('fs');
var async = require('async');
var u = require('util');
var logger = require('logger').create();
logger.level = 1;

// open connection to the CouchDB Blog database
var Blog = CouchClient("http://dasypygal.dyndns.org:5984/blog");

// open a file to write to
var jsonFile = fs.createWriteStream('posts.json', {'flags': 'w'});

// find all the Posts and iterate over them
var outputJson = new Array();

var queue = new Array();
Blog.view('/blog/_design/Post/_view/by_created_at', function(err, posts) {
  if (err) throw err;
  async.forEachSeries(posts.rows,function(item,callback){
    Blog.get(item.id,function(err,doc) {
      if (err) return callback(err);
      outputJson.push(doc);
      logger.info('post [added]: ' + doc.title);
    });
    callback(null);
  },function(err){
    if (err) throw err;
    setTimeout(function(){
      jsonFile.write(JSON.stringify(outputJson));
      logger.info('[TWO] outputJson.length='+outputJson.length);
    },10000);
  });
});

