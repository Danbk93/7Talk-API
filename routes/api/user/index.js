var express = require('express');
var router = express.Router();

var userCtrler = require('../../../controllers/user.ctrl');
var userModel = require('../../../models/user.model');

const sixHourMilliSec = 6 * 60 * 60 * 1000;
const monthMilliSec = 30 * 24 * 60 * 60 * 1000;

/*
	GET

	Load All User.
*/
router.get('/', function(req, res, next) {
  console.log('Load all user');

  userCtrler.loadAllUser(function(error, resultObject){
    res.json(resultObject);
  });

});


/*
	POST

	Create user.
*/
router.post('/', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var confirm = req.body.confirm;

  userCtrler.signup(email, password, "local", function(error, signupObject){

  	res.json(signupObject);
  });
});

/*
	PUT

	Update user.
*/
router.put('/', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  var resultObject = new Object({});

  console.log("Update user");

  resultObject.test = true;

  res.json(resultObject);
});


/*
	DELETE

	Delete user.
*/
router.delete('/', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

	console.log("Delete user data");

	userCtrler.withdraw(email, function(error, withdrawObject){
		res.json(withdrawObject);
	});
});

/*
	GET

	Load All User.
*/
router.get('/duplicate/:email', function(req, res, next) {
  var email = req.params.email;

  userCtrler.checkDuplicate(email, function(error, resultObject){
    res.json(resultObject);
  });

});

/*
	POST

	Try user signup and signin
*/
router.post('/signup', function(req, res, next) {
	var email = req.body.email.trim();
	var password = req.body.password;
	var confirm = req.body.confirm;


  userCtrler.signupAndSignin(email, password, confirm, function(error, resultObject){
    if(resultObject.signup){
      const accessToken = resultObject.accessToken;
      const refreshToken = resultObject.refreshToken;

  		res.cookie('access_token', accessToken,{ expires: new Date(Date.now() + sixHourMilliSec), httpOnly: true });
  		res.cookie('refresh_token', refreshToken,{ expires: new Date(Date.now() + monthMilliSec), httpOnly: true });
    }

    res.json(resultObject);
  });

});

/*
	DELETE

	Delete user.
*/
router.post('/withdraw', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

	console.log("Delete user data");

	userCtrler.withdraw(email, function(error, withdrawObject){
		res.json(withdrawObject);
	});
});


/*
	POST

	Try user signin.
*/
router.post('/signin/:platformName?', function(req, res, next) {
	var platformName = req.params.platformName || "local";
	var email = req.body.email.trim();
	var password = req.body.password;

  userCtrler.signin(email, password, platformName, function(error, resultObject){
		if(resultObject.signin){
			// signin success
			const accessToken = resultObject.accessToken;
			const refreshToken = resultObject.refreshToken;

			res.cookie('access_token', accessToken, { expires: new Date(Date.now() + sixHourMilliSec), httpOnly: true });
			res.cookie('refresh_token', refreshToken, { expires: new Date(Date.now() + monthMilliSec), httpOnly: true });
		}
		//console.log(JSON.stringify(resultObject));
		res.status(200).json(resultObject);
	});
});

/*
	POST

	Try user signout.
*/
router.post('/signout', function(req, res, next) {
	var email = req.body.email;
	console.log("signout");

	userCtrler.signout(email, function(error, resultSignout){
    if(resultSignout.signout){
  		res.clearCookie("access_token");
  		res.clearCookie("refresh_token");
    }
    res.json(resultSignout);
	});
});

/*
  GET

  user info
*/
router.get('/info', function(req, res, next) {
  var email = req.query.email;
  var page = req.query.page;

  userCtrler.loadUserInfo(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
  POST

  user info
*/
router.post('/info', function(req, res, next) {
  var name = req.body.name;
  var sex = req.body.sex;
  var birthday = req.body.birthday;
  var age = req.body.age;
  var address = req.body.address;
  var phoneNum = req.body.phoneNum;
  var introduction = req.body.introduction;
  var page = req.body.page;

  console.log(req.body);
  console.log(name, sex, birthday);

  var resultObject = new Object({});

  res.json(resultObject);
});

/*
  GET

  user interest
*/
router.get('/interest', function(req, res, next) {
  var email = req.query.email;
  var page = req.query.page;

  userModel.loadUserInterest(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
  POST

  user interest
*/
router.post('/interest', function(req, res, next) {
  var question = req.body.question;
  var answer = req.body.answer;
  var page = req.body.page;

  console.log(req.body);

  var resultObject = new Object({});

  res.json(resultObject);
});

/*
  POST

  user interest
*/
router.get('/same/interest', function(req, res, next) {
  var email = req.query.email;
  var opposite = req.query.opposite;

  userCtrler.loadSameInterest(email, opposite, function(error, resultObject){
    res.json(resultObject);
  });
});


module.exports = router;
