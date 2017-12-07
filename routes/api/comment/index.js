var express = require('express');
var router = express.Router();

var commentModel = require('../../../models/comment.model');

var authMiddleware = require('../../../middlewares/auth');


/*
	GET

	Load comment.
*/
router.get('/:postingId', function(req, res, next) {
  console.log('Load comment');

  var postingId = req.params.postingId;

  commentModel.loadPostingComment(postingId, function(error, resultObject){
    res.json(resultObject);
  });
});


/*
	POST

	Create comment.
*/
router.post('/', function(req, res, next) {
  var postingId = req.body.postingId;
  var email = req.body.email;
  var content = req.body.content;

  commentModel.addComment(email, postingId, content, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	PUT

	Update comment.
*/
router.put('/', function(req, res, next) {

});


/*
	DELETE

	Delete comment.
*/
router.delete('/:commentId', function(req, res, next) {
  var commentId = req.params.commentId;

  commentModel.removeComment(commentId, function(error, resultObject){
    res.json(resultObject);
  });
});


module.exports = router;
