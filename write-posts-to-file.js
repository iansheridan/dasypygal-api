var CouchClient = require('couch-client')
var fs = require('fs');
var async= require('async');
var u = require('util');
var logger = require('logger').create();
logger.level = 1;

// open connection to the CouchDB Blog database
var Blog = CouchClient("http://127.0.0.1:5984/blog");

// open a file to write to
var jsonFile = fs.createWriteStream('posts.json', {'flags': 'w'});

// find all the Posts and iterate over them
var outputJson = new Array();

function buildJsonOutput(){
  Blog.view('/blog/_design/Post/_view/by_created_at', {}, function(err, posts) {
    if (err) throw err;
    //jsonFile.write('[');
    async.forEachSeries(posts.rows,function(item,cb){
      Blog.get(item.id,function(err,doc) {
        if (err) throw err;
        outputJson.push(doc);
        logger.info('post [added]: ' + doc.title);
      });
    },function(err) {
      if (err) {
        logger.error(u.inpect(err));
        throw err;
      }
    });
  });
}

function writeJsonFile(){
  jsonFile.write(JSON.stringify(outputJson));
}

async.series([buildJsonOutput,writeJsonFile]);