var CouchClient = require('couch-client')
var fs = require('fs');
var asyncOne = require('async');
var asyncTwo = require('async');
var u = require('util');
var logger = require('logger').create();
logger.level = 1;

// open connection to the CouchDB Blog database
var Blog = CouchClient("http://127.0.0.1:5984/blog");

// open a file to write to
var jsonFile = fs.createWriteStream('posts.json', {'flags': 'w'});

// find all the Posts and iterate over them
var outputJson = new Array();

asyncOne.series({
  buildJsonPutput: function(callback){
    var queue = new Array();
    Blog.view('/blog/_design/Post/_view/by_created_at', {}, function(err, posts) {
      if (err) throw err;
      posts.rows.forEach(function(item){
        queue.push(Blog.get(item.id,function(err,doc) {
          if (err) throw err;
          outputJson.push(doc);
          logger.info('post [added]: ' + doc.title);
        }));
      });
      queue.push(logger.info('[ONE] outputJson.length='+outputJson.length));
    });
    asyncTwo.series(queue);
    callback(null, 'buildJsonPutput');
  },
  writeJson: function(callback){
    setInterval(function(){
      jsonFile.write(JSON.stringify(outputJson));
      logger.info('[TWO] outputJson.length='+outputJson.length);
    },1000)
    callback(null, 'writeJson');
  }
},function(err, results){
  logger.info(u.inspect(results));
});