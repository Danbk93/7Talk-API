var express = require('express');
var router = express.Router();

/*
  GET

  profile page
*/
router.get('/', function(req, res, next) {
  var resultObject = new Object({});

  res.render('user/profile');
});


module.exports = router;
