var express = require('express');
var router = express.Router();

var postingModel = require('../../../models/posting.model');


var authMiddleware = require('../../../middlewares/auth');


/*
  GET

  posting page
*/
router.get(['/', '/:idx/:postingNum'], function(req, res, next) {
  var idx = req.params.idx || 0;
  var postingNum = req.params.postingNum || 9;

  postingModel.loadAllPosting(idx, postingNum, function(error, resultObject){
    console.log(resultObject);
    res.render('posting/index', {
      postingJson: JSON.stringify(resultObject),
      postingNum: postingNum
    });
  });
});

/*
  GET

  post page
*/
router.get('/post', function(req, res, next) {
  var resultObject = new Object({});

  res.render('posting/post', {
    topicName:"post"
  });
});

module.exports = router;
