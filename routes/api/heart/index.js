var express = require('express');
var router = express.Router();

var heartCtrler = require('../../../controllers/heart.ctrl');

var authMiddleware = require('../../../middlewares/auth');

/*
	GET

	Load heart.
*/
router.get('/', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;

  heartCtrler.loadUserHeart(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	PUT

	Update heart.
*/
router.put('/', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;
  var changeNum = req.body.changeNum;

  heartCtrler.changeHeart(email, changeNum, function(error, resultObject){
    res.json(resultObject);
  });
});


/*
	POST

	Create heart.
*/
router.post('/', function(req, res, next) {
  var email = req.body.email;

  heartCtrler.createHeart(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	GET

	Load heart.
*/
router.get('/log', function(req, res, next) {
  var email = req.query.email;

  heartCtrler.loadUserHeartLog(email, function(error, resultObject){
    res.json(resultObject);
  });
});

module.exports = router;
