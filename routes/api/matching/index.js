var express = require('express');
var router = express.Router();


var matchingCtrler = require('../../../controllers/matching.ctrl');

var authMiddleware = require('../../../middlewares/auth');

router.use('/', authMiddleware);

/*
	POST

	Create matching.
*/
router.post('/accept', function(req, res, next) {
  var email = req.decoded.data.email;
  var oppositeEmail = req.body.oppositeEmail;

  console.log(email, oppositeEmail);

  matchingCtrler.acceptMatch(email, oppositeEmail, function(error, resultObject){
  	res.json(resultObject);
  });
});

/*
	POST

	Create matching.
*/
router.post('/reject', function(req, res, next) {
  var email = req.decoded.data.email;
  var oppositeEmail = req.body.oppositeEmail;

  console.log(email, oppositeEmail);

  matchingCtrler.rejectMatch(email, oppositeEmail, function(error, resultObject){
  	res.json(resultObject);
  });
});


module.exports = router;
