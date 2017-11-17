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


/*
  POST

  profile page
*/
router.post('/', function(req, res, next) {
  console.log(req.body);

  res.redirect('/user/info');
});


module.exports = router;
