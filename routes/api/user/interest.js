var express = require('express');
var router = express.Router();

/*
  GET

  user interest
*/
router.get('/', function(req, res, next) {
  var resultObject = new Object({});

});

/*
  POST

  user interest
*/
router.post('/', function(req, res, next) {
  var question = req.body.question;
  var answer = req.body.answer;

  console.log(req.body);

  var resultObject = new Object({});

  res.json(resultObject);
});


module.exports = router;
