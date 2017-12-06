var express = require('express');
var router = express.Router();

var userCtrler = require('../../../controllers/user.ctrl');
var heartCtrler = require('../../../controllers/heart.ctrl');

const sixHourMilliSec = 6 * 60 * 60 * 1000;
const monthMilliSec = 30 * 24 * 60 * 60 * 1000;


var authMiddleware = require('../../../middlewares/auth');

/*
	GET

	Read heart.
*/
router.get('/heart', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;

  heartCtrler.loadUserHeartLog(email, function(error, resultObject){

    res.render('user/heart', {
      heartLogJson: JSON.stringify(resultObject)
    });
  });
});


/*
  GET

  main page
*/
router.get('/main', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;

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
router.get('/', authMiddleware, function(req, res, next) {
  var resultObject = new Object({});

  res.render('user/profile');
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

  interest page
*/
router.get('/interest', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;

  userCtrler.userMainRouting(email, function(error, result){
    res.render(result.renderPage);
  });
});

/********************************************************************************************************************/

module.exports = router;
