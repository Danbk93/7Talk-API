var express = require('express');
var router = express.Router();

/*
  GET

  info page
*/
router.get('/', function(req, res, next) {
  var resultObject = new Object({});

  res.render('user/info');
});

/*
  POST

  info page
*/
router.post('/', function(req, res, next) {
  console.log(req.body);

  res.redirect('/user/interest');
});


module.exports = router;
