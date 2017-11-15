var express = require('express');
var router = express.Router();

var config = require('config.json')('./config/config.json');

var userModel = require('../../../models/user.model');

const sixHourMilliSec = 6 * 60 * 60 * 1000;
const monthMilliSec = 30 * 24 * 60 * 60 * 1000;


/*
	GET

	Read user.
*/
router.get('/', function(req, res, next) {
  console.log('get user');
  var resultObject = new Object({});

  userModel.loadAllUser(function(error, userObject){
    res.json(userObject);
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

  userModel.signup(email, password, "local", function(error, signupObject){
    console.log("signup");

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

	userModel.withdraw(email, function(error, withdrawObject){
		res.json(withdrawObject);
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

	userModel.withdraw(email, function(error, withdrawObject){
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

	//console.log("signin - platformName : ", platformName);
	//console.log(req.body);

	var resultObject = new Object({});
	var token = null;
	if(platformName === "kakao"){
		//token = req.cookies.kakao_token;
		token = "kakao";


	}else{

	}

	//console.log(email, password, platformName, token);

	userModel.signin(email, password, platformName, token, function(error, signinObject){
		resultObject.error = signinObject.error;
		if(error){
			console.log('Error : ', error);

			res.json(resultObject);
		}else{
			resultObject.signin = signinObject.signin;
			resultObject.emailCheck = signinObject.emailCheck;

			//console.log(signinObject);
			//console.log(resultObject);

			if(signinObject.signin){
				// signin success

				const accessToken = signinObject.accessToken;
				const refreshToken = signinObject.refreshToken;
				//console.log(accessToken);
        resultObject.accessToken = accessToken;
        resultObject.refreshToken = refreshToken;

				res.cookie('access_token', accessToken, { expires: new Date(Date.now() + sixHourMilliSec), httpOnly: true });
				res.cookie('refresh_token', refreshToken, { expires: new Date(Date.now() + monthMilliSec), httpOnly: true });
				res.json(resultObject);

			}else{
				// signin fail

				res.json(resultObject);
			}

		}
	});

});

/*
	POST

	Try user signout.
*/
router.post('/signout', function(req, res, next) {
	var email = req.decoded.data.email;
  var resultObject = new Object({});
	console.log("signout");

  console.log(email);

	userModel.signout(email, function(error, resultSignout){
    resultObject.signout = true;

		res.clearCookie("access_token");
		res.clearCookie("refresh_token");
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

	//console.log(email, password, confirm);

	var resultObject = new Object({});

	var atCheck = email.indexOf("@");

	//console.log(atCheck);

	if(atCheck === -1){
		resultObject.atCheck = false;

		res.json(resultObject);
	}else{
		resultObject.atCheck = true;
		if(password === confirm){
			resultObject.confirm = true;
			userModel.duplicateCheck(email, function(error, duplicateObject){
				if(error){
					console.log("Error : ", error);
					resultObject.error = true;

					res.json(resultObject);
				}else{
					resultObject.error = false;

					if(duplicateObject.duplicate){
						// Already join
						resultObject.duplicate = true;

						res.json(resultObject);
					}else{
						// No same ID
						resultObject.duplicate = false;
						console.log("Create user data");

						userModel.signup(email, password, "local", function(error, resultSignup){
							if(error){
								resultObject.error = true;
								console.log("signup error");

								resultObject.signup = false;

								res.json(resultObject);
							}else{
								//console.log("check1");
								resultObject.signup = true;

								userModel.signin(email, password, "local", "", function(error, signinObject){
									if(error){
										console.log('Error : ', error);
										resultObject.error = true;
										resultObject.signin = false;

										res.json(resultObject);
									}else{
										//console.log("check2");
										resultObject.error = false;
										if(signinObject.signin){
											// signin success
											resultObject.signin = true;
											var accessToken = signinObject.accessToken;
											var refreshToken = signinObject.refreshToken;

											resultObject.accessToken = accessToken;
											resultObject.refreshToken = refreshToken;

											res.cookie('access_token', accessToken,{ expires: new Date(Date.now() + sixHourMilliSec), httpOnly: true });
											res.cookie('refresh_token', refreshToken,{ expires: new Date(Date.now() + monthMilliSec), httpOnly: true });

											//console.log(resultObject);

											res.json(resultObject);
										}else{
											// signin fail
											resultObject.signin = false;

											res.json(resultObject);
										}

									}
								});
							}

						});
					}
				}

			});
		}else{
			resultObject.confirm = false;
			res.json(resultObject);
		}
	}
});



module.exports = router;
