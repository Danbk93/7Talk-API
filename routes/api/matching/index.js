var express = require('express');
var router = express.Router();

var matchingModel = require('../../../models/matching.model');

var matchingAlgorithm = require('../../../js/matching_algorithm');

/*
	GET

	Load matching.
*/
router.get('/', function(req, res, next) {
  var email = req.query.email;

  matchingModel.loadMatching(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	GET

	Load matching candidates.
*/
router.get('/candidates', function(req, res, next) {
  var email = req.query.email;

  matchingAlgorithm.matchingAlgorithm(email, function(error, resultObject){
    res.json(resultObject);
  });
});


/*
	POST

	Create matching.
*/
router.post('/', function(req, res, next) {
  var email = req.body.email;
  var oppositeEmail = req.body.oppositeEmail;
  var similarity = req.body.similarity;

  matchingModel.addMatching(email, oppositeEmail, similarity, function(error, resultObject){
  	res.json(resultObject);
  });
});


module.exports = router;
