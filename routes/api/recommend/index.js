var express = require('express');
var router = express.Router();

var recommendCtrl = require('../../../controllers/recommend.ctrl');
var recommendModel = require('../../../models/recommend.model');

/*
	GET

	Load recommend.
*/
router.get('/', function(req, res, next) {
  var email = req.query.email;
  var matchCheck = req.query.matchCheck;

  recommendModel.loadRecommend(email, matchCheck, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	GET

	start blind chat test.
*/
router.get('/start', function(req, res, next) {
  var email = req.query.email;
  
  recommendCtrl.startBlindChat(email, function(error, resultObject){
    res.json(resultObject);
  });
});


/*
	POST

	Create recommend.
*/
router.post('/', function(req, res, next) {
  var email = req.body.email;
  var oppositeUserArray = req.body.oppositeUserArray;
  var similarityArray = req.body.similarityArray;

  recommendModel.addRecommend(email, oppositeUserArray, similarityArray, function(error, resultObject){
  	res.json(resultObject);
  });
});


/*
	GET

	Create recommend.
*/
router.get('/invitation', function(req, res, next) {
  var email = req.query.email;

  recommendModel.loadInvitation(email, function(error, resultObject){
  	res.json(resultObject);
  });
});

/*
	GET

	Create recommend.
*/
router.get('/alert', function(req, res, next) {
  var email = req.query.email;

  recommendModel.loadAlert(email, function(error, resultObject){
  	res.json(resultObject);
  });
});

module.exports = router;
