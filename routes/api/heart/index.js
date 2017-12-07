var express = require('express');
var router = express.Router();

var heartCtrler = require('../../../controllers/heart.ctrl');

var authMiddleware = require('../../../middlewares/auth');

/*
	GET

	Load heart.
*/
router.get('/',  function(req, res, next) {
  var email = req.query.email;

  heartCtrler.startManageHeart(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	PUT

	Update heart.
*/
router.put('/',  function(req, res, next) {
  var email = req.query.email;
  var changeNum = req.body.changeNum;

  heartCtrler.changeHeart(email, changeNum, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	GET

	Load heart log.
*/
router.get('/log', function(req, res, next) {
  var email = req.query.email;

  heartCtrler.loadUserHeartLog(email, function(error, resultObject){
    res.json(resultObject);
  });
});

module.exports = router;
