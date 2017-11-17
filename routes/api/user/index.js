var express = require('express');
var router = express.Router();

var userCtrl = require('../../../controllers/user.ctrl');

const sixHourMilliSec = 6 * 60 * 60 * 1000;
const monthMilliSec = 30 * 24 * 60 * 60 * 1000;

/*
	GET

	Load All User.
*/
router.get('/', function(req, res, next) {
  console.log('Load all user');

  userCtrl.loadAllUser(function(error, resultObject){
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

  userCtrl.signup(email, password, "local", function(error, signupObject){

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

	userCtrl.withdraw(email, function(error, withdrawObject){
		res.json(withdrawObject);
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


  userCtrl.signupAndSignin(email, password, confirm, function(error, resultObject){
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

	userCtrl.withdraw(email, function(error, withdrawObject){
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

  userCtrl.signin(email, password, platformName, function(error, resultObject){
		if(resultObject.signin){
			// signin success
			const accessToken = resultObject.accessToken;
			const refreshToken = resultObject.refreshToken;

			res.cookie('access_token', accessToken, { expires: new Date(Date.now() + sixHourMilliSec), httpOnly: true });
			res.cookie('refresh_token', refreshToken, { expires: new Date(Date.now() + monthMilliSec), httpOnly: true });
		}

    res.json(resultObject);
	});
});

/*
	POST

	Try user signout.
*/
router.post('/signout', function(req, res, next) {
	var email = req.body.email;
	console.log("signout");

	userCtrl.signout(email, function(error, resultSignout){
    if(resultSignout.signout){
  		res.clearCookie("access_token");
  		res.clearCookie("refresh_token");
    }
    res.json(resultSignout);
	});


});

module.exports = router;
