var express = require('express');
var router = express.Router();


/*
	GET

	Load matching.
*/
router.get('/chatRoom', function(req, res, next) {
  var email = req.query.email;

  matchingModel.loadMatching(email, function(error, resultObject){
    res.json(resultObject);
  });
});

module.exports = router;
