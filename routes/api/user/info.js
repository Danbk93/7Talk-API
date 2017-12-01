var express = require('express');
var router = express.Router();

/*
  GET

  user info
*/
router.get('/', function(req, res, next) {
  var resultObject = new Object({});

  res.render('user/info');
});

/*
  POST

  user info
*/
router.post('/', function(req, res, next) {
  var name = req.body.name;
  var sex = req.body.sex;
  var birthday = req.body.birthday;
  var age = req.body.age;
  var address = req.body.address;
  var phoneNum = req.body.phoneNum;
  var introduction = req.body.introduction;

  console.log(name, sex, birthday);

  res.redirect('/user/interest');
});


module.exports = router;
