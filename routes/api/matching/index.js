var express = require('express');
var router = express.Router();


var matchingCtrler = require('../../../controllers/matching.ctrl');

var authMiddleware = require('../../../middlewares/auth');

router.use('/', authMiddleware);

/*
	POST

	Create matching.
*/
router.post('/', function(req, res, next) {
  var email = req.decode.data.email;
  var oppositeEmail = req.body.oppositeEmail;

  matchingCtrler.acceptMatch(email, oppositeEmail, function(error, resultObject){
  	res.json(resultObject);
  });
});


module.exports = router;
