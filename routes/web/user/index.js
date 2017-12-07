var express = require('express');
var router = express.Router();

var userCtrler = require('../../../controllers/user.ctrl');
var heartCtrler = require('../../../controllers/heart.ctrl');


var postingModel = require('../../../models/posting.model');

const sixHourMilliSec = 6 * 60 * 60 * 1000;
const monthMilliSec = 30 * 24 * 60 * 60 * 1000;

/*
	GET

	Read heart.
*/
router.get('/heart', function(req, res, next) {
  var email = req.query.email;

  heartCtrler.loadUserHeartLog(email, function(error, resultObject){

    res.render('user/heart', {
      heartLogJson: JSON.stringify(resultObject)
    });
  });
});


/*
	GET

	Read heart charge.
*/
router.get('/heart/charge', function(req, res, next) {
  var email = req.query.email;

  res.render('user/charge_heart')
});


/*
  GET

  main page
*/
router.get('/main', function(req, res, next) {
  var email = req.query.email;

  userCtrler.userMainRouting(email, function(error, resultObject){
    var renderPage = resultObject.renderPage;

    res.render(renderPage);
  });
});


/*
  GET

  Loading oauth page.
*/
router.get('/oauth', function(req, res, next) {
  console.log("oauth");
	var nickname = req.query.nickname;
	var email = req.query.email;


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
router.get('/profile', function(req, res, next) {
  var resultObject = new Object({});

  res.render('user/profile');
});

/*
  GET

  posting page
*/
router.get('/posting', function(req, res, next) {
  var email = req.query.email;
  var idx = 0;
  var postingNum = 9;

  postingModel.loadUserPosting(email, idx, postingNum, function(error, resultObject){
    console.log(resultObject);

    res.render('user/posting',{
      postingJson: JSON.stringify(resultObject),
      postingNum: postingNum
    });
  });

});

/********************************************************************************************************************/
/*
	GET

	User signup page.
*/
router.get('/signup', function(req, res, next) {
  console.log('\n\tuser signup page\n');

  res.render('user/signup', {auth:false});
});

/*
	GET

	User clause.
*/
router.get('/clause', function(req, res, next) {
  console.log('\n\tuser clause page\n');

  res.render('user/clause');
});

/*
  GET

  info page
*/
router.get('/info', function(req, res, next) {
  var email = req.query.email;

  res.render('user/info')
});


/*
  GET

  interest page
*/
router.get('/interest', function(req, res, next) {
  var email = req.query.email;

  userCtrler.userMainRouting(email, function(error, result){
    console.log(result.renderPage);
    res.render(result.renderPage);
  });
});

/********************************************************************************************************************/

module.exports = router;
