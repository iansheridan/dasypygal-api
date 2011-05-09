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
    posts.rows.forEach(function(item){
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
    logger.info('outputJson.length='+outputJson.length);
  });
}

function writeJsonFile(){
  jsonFile.write(JSON.stringify(outputJson));
  logger.info('outputJson.length='+outputJson.length);
}

async.series([buildJsonOutput,writeJsonFile]);