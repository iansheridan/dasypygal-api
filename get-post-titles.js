var CouchClient = require('couch-client'),
    u = require('util');
var Blog = CouchClient("http://localhost:5984/blog");
Blog.view('/blog/_design/Post/_view/by_created_at', {}, function(err, posts) {
  posts.rows.forEach(function(post) {
    Blog.get(post.id,function(err,doc) {
      console.log('Found post: ' + doc.title);
    });
  });
});
