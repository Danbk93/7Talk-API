var express = require('express');
var router = express.Router();

var recommendCtrl = require('../../../controllers/recommend.ctrl');
var recommendModel = require('../../../models/recommend.model');

var authMiddleware = require('../../../middlewares/auth');


router.use('/', authMiddleware);

/*
	GET

	Load recommend.
*/
router.get('/', function(req, res, next) {
  var email = req.decoded.data.email;
  var matchCheck = req.query.matchCheck;

  recommendModel.loadRecommend(email, matchCheck, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	POST

	start blind chat test.
*/
router.post('/', function(req, res, next) {
  var email = req.decoded.data.email;

  recommendCtrl.startBlindChat(email, function(error, resultObject){
    res.json(resultObject);
  });
});


/*
	GET

	Create recommend.
*/
router.get('/invitation', function(req, res, next) {
  var email = req.decoded.data.email;

  recommendModel.loadInvitation(email, function(error, resultObject){
  	res.json(resultObject);
  });
});

/*
	GET

	Create recommend.
*/
router.get('/alert', function(req, res, next) {
  var email = req.decoded.data.email;

  recommendCtrl.askAcceptAlarm(email, function(error, resultObject){
  	res.json(resultObject);
  });
});

module.exports = router;
