var express = require('express');
var router = express.Router();

var userCtrl = require('../../../controllers/user.ctrl');

const sixHourMilliSec = 6 * 60 * 60 * 1000;
const monthMilliSec = 30 * 24 * 60 * 60 * 1000;

/*
	GET

	User signin page.
*/
router.get('/signin', function(req, res, next) {
  console.log('user signin page');

  res.render('user/signin');
});

/*
	GET

	User signup page.
*/
router.get('/signup', function(req, res, next) {
  console.log('user signup page');

  res.render('user/signup');
});

/*
	GET

	User clause.
*/
router.get('/clause', function(req, res, next) {
  console.log('user clause page');

  res.render('user/clause');
});


module.exports = router;
