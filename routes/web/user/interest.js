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


/*
  POST

  interest page
*/
router.post('/', function(req, res, next) {
  console.log(req.body);

  res.redirect('/user/main');
});

module.exports = router;
