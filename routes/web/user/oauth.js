var express = require('express');
var router = express.Router();

var config = require('config.json')('./config/config.json');

const qs = require('querystring');


/*
  GET

  Loading oauth page.
*/
router.get('/', function(req, res, next) {
	var nickname = req.query.nickname;
	var email = req.query.email;
  //console.log("oauth");

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

module.exports = router;
