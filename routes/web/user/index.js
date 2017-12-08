var express = require('express');
var router = express.Router();

var userCtrler = require('../../../controllers/user.ctrl');
var heartCtrler = require('../../../controllers/heart.ctrl');


var postingModel = require('../../../models/posting.model');

const sixHourMilliSec = 6 * 60 * 60 * 1000;
const monthMilliSec = 30 * 24 * 60 * 60 * 1000;


var authMiddleware = require('../../../middlewares/auth');


/********************************************************************************************************************/
/*
	GET

	User signup page.
*/
router.get('/signup', function(req, res, next) {
  console.log('\n\tuser signup page\n');

  res.render('user/signup', {
    auth:false
  });
});

/*
	GET

	User clause.
*/
router.get('/clause', function(req, res, next) {
  console.log('\n\tuser clause page\n');

  res.render('user/clause');
});



/********************************************************************************************************************/


/*
  GET

  interest page
*/
router.get('/interest', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;

  userCtrler.userMainRouting(email, function(error, result){
    console.log(result.renderPage);
    res.render(result.renderPage);
  });
});

/*
  GET

  main page
*/
router.get('/main', authMiddleware, function(req, res, next) {
  //console.log("main ", req.decoded);
  var email = req.decoded.data.email;

  userCtrler.userMainRouting(email, function(error, resultObject){
    var renderPage = resultObject.renderPage;

    res.render(renderPage);
  });
});

/*
  GET

  info page
*/
router.get('/info', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;

  userCtrler.startManageMyInfo(email, function(error, resultObject){
    //console.log(resultObject);
    res.render('user/info', {
      resultJson : JSON.stringify(resultObject)
    });
  });
});


/*
  GET

  profile page
*/
router.get('/profile', authMiddleware, function(req, res, next) {
  var resultObject = new Object({});

  res.render('user/profile');
});

/*
  GET

  posting page
*/
router.get('/posting', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;
  var idx = 0;
  var postingNum = 9;

  postingModel.loadUserPosting(email, idx, postingNum, function(error, resultObject){
    //console.log(resultObject);

    res.render('user/posting',{
      postingJson: JSON.stringify(resultObject),
      postingNum: postingNum
    });
  });

});

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

	Read heart charge.
*/
router.get('/heart/charge', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;

  res.render('user/charge_heart');
});

router.get('/change_password', authMiddleware, function(req, res, next) {
  var email = req.decoded.data.email;

  res.render('user/change_password');
});

module.exports = router;
