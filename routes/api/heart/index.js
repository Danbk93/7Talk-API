var express = require('express');
var router = express.Router();

var heartModel = require('../../../models/heart.model');


/*
	GET

	Load heart.
*/
router.get('/', function(req, res, next) {
  var email = req.query.email;

  heartModel.loadUserHeart(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	PUT

	Update heart.
*/
router.put('/', function(req, res, next) {
  var email = req.query.email;

  heartModel.loadUserHeart(email, function(error, resultObject){
    res.json(resultObject);
  });
});


/*
	POST

	Create heart.
*/
router.post('/', function(req, res, next) {
  var email = req.body.email;


});


module.exports = router;
