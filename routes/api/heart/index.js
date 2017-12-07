var express = require('express');
var router = express.Router();

var heartCtrler = require('../../../controllers/heart.ctrl');

var authMiddleware = require('../../../middlewares/auth');


router.use('/', authMiddleware);

/*
	GET

	Load heart.
*/
router.get('/',  function(req, res, next) {
  var email = req.decoded.data.email;

  heartCtrler.startManageHeart(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	PUT

	Update heart.
*/
router.put('/',  function(req, res, next) {
  var email = req.decoded.data.email;
  var changeNum = req.body.changeNum;

  heartCtrler.changeHeart(email, changeNum, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	GET

	Load heart log.
*/
router.get('/log', function(req, res, next) {
  var email = req.decoded.data.email;

  heartCtrler.loadUserHeartLog(email, function(error, resultObject){
    res.json(resultObject);
  });
});

/*
	POST

	Create payment log.
*/
router.post('/payments/complete', function(req, res, next) {
  var email = req.decoded.data.email;
  console.log("/payments/complete");

  //console.log(req.body);

  var resultObject = new Object({});

  resultObject.code = 0;
  resultObject.message = "결제가 완료되었습니다.";


  res.json(resultObject);
});


module.exports = router;
