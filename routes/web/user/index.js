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

  res.render('user/signup', {auth:false});
});

/*
	GET

	User clause.
*/
router.get('/clause', function(req, res, next) {
  console.log('user clause page');

  res.render('user/clause');
});


/*
	GET

	Read heart.
*/
router.get('/heart', function(req, res, next) {
//  console.log('get user');

  res.render('user/heart');
});

/*
  GET

  info page
*/
router.get('/info', function(req, res, next) {
  var resultObject = new Object({});

  res.render('user/info');
});


/*
  GET

  interest page
*/
router.get('/interest', function(req, res, next) {
  var resultObject = new Object({});

  res.render('user/interest');
});


/*
  GET

  main page
*/
router.get('/main', function(req, res, next) {
  var email = req.query.email || undefined;
  var nickname = req.query.nickname || undefined;

  // TODO modify branch
  if(email){
    userCtrl.userMainRouting(email, function(error, resultObject){
      var renderPage = resultObject.renderPage;

      res.render(renderPage);
    });
  }else{
    // TEST page
    res.render("user/main");
  }

});


/*
  GET

  Loading oauth page.
*/
router.get('/', function(req, res, next) {
	var nickname = req.query.nickname;
	var email = req.query.email;
  //console.log("oauth");

  //console.log(req.query);

	var userObject = new Object({});
	userObject.nickname = nickname;
	userObject.email = email;

	var userJson = JSON.stringify(userObject);

	res.render('user/oauth_success', {
		title:global.title,
		userJson:userJson
	});

});


/*
  GET

  profile page
*/
router.get('/', function(req, res, next) {
  var resultObject = new Object({});

  res.render('user/profile');
});

module.exports = router;
