var CouchClient = require('couch-client')
var fs = require('fs');
var async= require('async');
var u = require('util');
var logger = require('logger').create();
logger.level = 1;
var events = require("events").EventEmitter;

// open connection to the CouchDB Blog database
var Blog = CouchClient("http://localhost:5984/blog");

// open a file to write to
var jsonFile = fs.createWriteStream('posts.json', {'flags': 'a'});

// find all the Posts and iterate over them
var outputJson = new Array();
Blog.view('/blog/_design/Post/_view/by_created_at', {}, function(err, posts) {
  if (err) throw err;
  //jsonFile.write('[');
  async.forEachSeries(posts.rows,function(item,cb){
    Blog.get(item.id,function(err,doc) {
      if (err) throw err;
      //jsonFile.write( '\n\t' + JSON.stringify(doc) + ',' );
      outputJson.push(doc);
      logger.info('post [added]: ' + doc.title);
    });
    cb();
  },function(err) {
    if (err) throw err;
    //jsonFile.write('\n]');
    logger.info('finished writing to file');
  });
  events.on("end",function(stream){
    jsonFile.write(JSON.stringify(outputJson));
  });
});
