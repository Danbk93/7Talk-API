var express = require('express');
var router = express.Router();

/*
  GET

  interest page
*/
router.get('/', function(req, res, next) {
  var resultObject = new Object({});

  res.render('user/interest');
});


module.exports = router;
