var express = require('express');
var router = express.Router();

/*
  GET

  post page
*/
router.get('/', function(req, res, next) {
  var resultObject = new Object({});

  res.render('posting/post', {
    topicName:"post"
  });
});

module.exports = router;
