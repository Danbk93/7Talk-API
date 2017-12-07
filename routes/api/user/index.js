var express = require('express');
var router = express.Router();

var userCtrler = require('../../../controllers/user.ctrl');
var userModel = require('../../../models/user.model');


const monthMilliSec = 30 * 24 * 60 * 60 * 1000;


var authMiddleware = require('../../../middlewares/auth');


/*
	GET

	Check duplicate User.
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
  var userObject = req.body;

  //console.log(userObject);

  userCtrler.signupAndSignin(userObject, function(error, resultObject){
    console.log(resultObject);
    if(resultObject.code === 0){
      const accessToken = resultObject.data.accessToken;
      const refreshToken = resultObject.data.refreshToken;

  		res.cookie('access_token', accessToken,{ expires: new Date(Date.now() + monthMilliSec), httpOnly: true });
    }

    res.json(resultObject);
  });

});

/*
	DELETE

	Delete user.
*/
router.post('/withdraw', authMiddleware,  function(req, res, next) {
  var email = req.decoded.data.email;
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
		if(resultObject.code === 0){
			// signin success
      //console.log(resultObject);
			const accessToken = resultObject.data.accessToken;

			res.cookie('access_token', accessToken, { expires: new Date(Date.now() + monthMilliSec), httpOnly: true });
		}

		res.status(200).json(resultObject);
	});
});

/*
	POST

	Try user signout.
*/
router.post('/signout', authMiddleware,  function(req, res, next) {
	var email = req.decoded.data.email;
	console.log("signout");

	userCtrler.signout(email, function(error, resultSignout){
    if(resultSignout.signout){
  		res.clearCookie("access_token");
    }
    res.json(resultSignout);
	});
});

/*
  GET

  user info
*/
router.get('/info', authMiddleware,  function(req, res, next) {
  var email = req.decoded.data.email;
  var page = req.query.page;

  userCtrler.startManageMyInfo(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
  GET

  user interest
*/
router.get('/interest', authMiddleware,  function(req, res, next) {
  var email = req.decoded.data.email;
  var page = req.query.page;

  userModel.userMainRouting(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
  POST

  user interest
*/
router.post('/interest', authMiddleware,  function(req, res, next) {
var email = req.decoded.data.email;
  var page = req.body.page;
  var answerArray = req.body.value;

  //console.log(req.body);

  userModel.updateUserInterest(email, answerArray, page, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
  POST

  user interest
*/
router.get('/same/interest', function(req, res, next) {
  var email = req.decoded.data.email;
  var opposite = req.query.opposite;

  userCtrler.loadSameInterest(email, opposite, function(error, resultObject){
    res.json(resultObject);
  });
});


module.exports = router;
