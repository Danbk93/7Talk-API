var express = require('express');
var router = express.Router();
var config = require('config.json')('./config/config.json');

/*
  GET
*/
router.get(['/', '/:topicName'], function(req, res, next) {
  var topicName = req.params.topicName || "public";
  res.render('chatting/index', {
    host: "192.168.44.118",
    topicName: topicName
  });
});

/*
  POST
*/
router.post(['/', '/:topicName'], function(req, res, next) {
	var topicName = req.params.topicName;
  console.log('subscribe');
	console.log('topicName : ' + topicName);


  res.send(topicName);
  //mqttClient.subscribe(topicName);
});

/*
  Delete
*/
router.delete(['/', '/:topicName'], function(req, res, next) {
	var topicName = req.params.topicName;
  console.log('unsubscribe');
  console.log('topicName : ' + topicName);

  res.send(topicName);
});

module.exports = router;
